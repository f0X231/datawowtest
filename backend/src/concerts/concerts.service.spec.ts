import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReservationAction } from '../reservations/entities/reservation.entity';
import { ConcertsService } from './concerts.service';
import { Concert } from './entities/concert.entity';

const mockConcertRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('ConcertsService', () => {
  let service: ConcertsService;
  let repo: ReturnType<typeof mockConcertRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertsService,
        { provide: getRepositoryToken(Concert), useFactory: mockConcertRepo },
      ],
    }).compile();

    service = module.get<ConcertsService>(ConcertsService);
    repo = module.get(getRepositoryToken(Concert));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create and return a concert', async () => {
      const dto = { name: 'Rock Fest', description: 'Annual rock festival', totalSeats: 500 };
      const saved = { id: 1, ...dto, createdAt: new Date(), reservations: [] };

      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      const result = await service.create(dto);
      expect(repo.create).toHaveBeenCalledWith({ name: dto.name, description: dto.description, totalSeats: dto.totalSeats });
      expect(result).toEqual(saved);
    });

    it('should default description to empty string when not provided', async () => {
      const dto = { name: 'Jazz Night', totalSeats: 100 };
      const saved = { id: 2, name: 'Jazz Night', description: '', totalSeats: 100, createdAt: new Date(), reservations: [] };

      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      await service.create(dto);
      expect(repo.create).toHaveBeenCalledWith({ name: 'Jazz Night', description: '', totalSeats: 100 });
    });
  });

  describe('remove', () => {
    it('should remove concert by id', async () => {
      const concert = { id: 1, name: 'Rock Fest', totalSeats: 500 } as Concert;
      repo.findOne.mockResolvedValue(concert);
      repo.remove.mockResolvedValue(concert);

      await service.remove(1);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repo.remove).toHaveBeenCalledWith(concert);
    });

    it('should throw NotFoundException if concert does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllWithSeats', () => {
    it('should return concerts with correct seat counts', async () => {
      const now = new Date();
      const reservations = [
        { userId: 1, action: ReservationAction.RESERVE, createdAt: now },
        { userId: 2, action: ReservationAction.RESERVE, createdAt: now },
      ];
      repo.find.mockResolvedValue([{ id: 1, name: 'Rock Fest', description: 'Desc', totalSeats: 500, createdAt: now, reservations }]);

      const result = await service.findAllWithSeats();
      expect(result[0].reservedCount).toBe(2);
      expect(result[0].availableSeats).toBe(498);
    });

    it('should return 0 available seats when fully booked', async () => {
      const now = new Date();
      repo.find.mockResolvedValue([{
        id: 1, name: 'Full Fest', description: '', totalSeats: 1, createdAt: now,
        reservations: [{ userId: 1, action: ReservationAction.RESERVE, createdAt: now }],
      }]);

      const result = await service.findAllWithSeats();
      expect(result[0].availableSeats).toBe(0);
    });

    it('should free up seats when a user cancels', async () => {
      const t1 = new Date('2024-01-01T10:00:00Z');
      const t2 = new Date('2024-01-01T11:00:00Z');
      repo.find.mockResolvedValue([{
        id: 1, name: 'Fest', description: '', totalSeats: 100, createdAt: t1,
        reservations: [
          { userId: 1, action: ReservationAction.RESERVE, createdAt: t1 },
          { userId: 1, action: ReservationAction.CANCEL, createdAt: t2 },
        ],
      }]);

      const result = await service.findAllWithSeats();
      expect(result[0].reservedCount).toBe(0);
      expect(result[0].availableSeats).toBe(100);
    });

    it('should set userReserved=true for a user with an active reservation', async () => {
      const now = new Date();
      repo.find.mockResolvedValue([{
        id: 1, name: 'Fest', description: '', totalSeats: 100, createdAt: now,
        reservations: [{ userId: 42, action: ReservationAction.RESERVE, createdAt: now }],
      }]);

      const result = await service.findAllWithSeats(42);
      expect(result[0].userReserved).toBe(true);
    });

    it('should set userReserved=false after the user cancels', async () => {
      const t1 = new Date('2024-01-01T10:00:00Z');
      const t2 = new Date('2024-01-01T11:00:00Z');
      repo.find.mockResolvedValue([{
        id: 1, name: 'Fest', description: '', totalSeats: 100, createdAt: t1,
        reservations: [
          { userId: 42, action: ReservationAction.RESERVE, createdAt: t1 },
          { userId: 42, action: ReservationAction.CANCEL, createdAt: t2 },
        ],
      }]);

      const result = await service.findAllWithSeats(42);
      expect(result[0].userReserved).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should aggregate total seats, reserved, and cancelled counts across all concerts', async () => {
      repo.find.mockResolvedValue([
        {
          id: 1, totalSeats: 300,
          reservations: [
            { action: ReservationAction.RESERVE },
            { action: ReservationAction.RESERVE },
            { action: ReservationAction.CANCEL },
          ],
        },
        {
          id: 2, totalSeats: 200,
          reservations: [{ action: ReservationAction.RESERVE }],
        },
      ]);

      const stats = await service.getStats();
      expect(stats.totalSeats).toBe(500);
      expect(stats.totalReserved).toBe(3);
      expect(stats.totalCancelled).toBe(1);
    });
  });
});
