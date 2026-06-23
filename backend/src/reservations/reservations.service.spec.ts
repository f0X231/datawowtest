import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Concert } from '../concerts/entities/concert.entity';
import { Reservation, ReservationAction } from './entities/reservation.entity';
import { ReservationsService } from './reservations.service';

const mockRepoFactory = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
});

const makeReservation = (
  userId: number,
  action: ReservationAction,
  createdAt: Date = new Date(),
): Partial<Reservation> => ({ userId, action, createdAt } as Reservation);

describe('ReservationsService', () => {
  let service: ReservationsService;
  let reservationsRepo: ReturnType<typeof mockRepoFactory>;
  let concertsRepo: ReturnType<typeof mockRepoFactory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: getRepositoryToken(Reservation), useFactory: mockRepoFactory },
        { provide: getRepositoryToken(Concert), useFactory: mockRepoFactory },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    reservationsRepo = module.get(getRepositoryToken(Reservation));
    concertsRepo = module.get(getRepositoryToken(Concert));
  });

  afterEach(() => jest.clearAllMocks());

  describe('reserve', () => {
    it('should successfully reserve a seat', async () => {
      const concert = { id: 1, totalSeats: 100, reservations: [] } as unknown as Concert;
      const savedRow = { id: 1, userId: 10, concertId: 1, action: ReservationAction.RESERVE };

      concertsRepo.findOne.mockResolvedValue(concert);
      reservationsRepo.create.mockReturnValue(savedRow);
      reservationsRepo.save.mockResolvedValue(savedRow);

      const result = await service.reserve(10, 1);
      expect(result.action).toBe(ReservationAction.RESERVE);
      expect(reservationsRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if concert does not exist', async () => {
      concertsRepo.findOne.mockResolvedValue(null);
      await expect(service.reserve(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user already has an active reservation', async () => {
      const concert = {
        id: 1,
        totalSeats: 100,
        reservations: [makeReservation(10, ReservationAction.RESERVE)],
      } as unknown as Concert;

      concertsRepo.findOne.mockResolvedValue(concert);
      await expect(service.reserve(10, 1)).rejects.toThrow(BadRequestException);
    });

    it('should allow re-reservation after a cancel', async () => {
      const t1 = new Date('2024-01-01T10:00:00Z');
      const t2 = new Date('2024-01-01T11:00:00Z');
      const concert = {
        id: 1,
        totalSeats: 100,
        reservations: [
          makeReservation(10, ReservationAction.RESERVE, t1),
          makeReservation(10, ReservationAction.CANCEL, t2),
        ],
      } as unknown as Concert;

      const savedRow = { id: 2, userId: 10, concertId: 1, action: ReservationAction.RESERVE };
      concertsRepo.findOne.mockResolvedValue(concert);
      reservationsRepo.create.mockReturnValue(savedRow);
      reservationsRepo.save.mockResolvedValue(savedRow);

      const result = await service.reserve(10, 1);
      expect(result.action).toBe(ReservationAction.RESERVE);
    });

    it('should throw BadRequestException when concert is fully booked', async () => {
      const concert = {
        id: 1,
        totalSeats: 2,
        reservations: [
          makeReservation(1, ReservationAction.RESERVE),
          makeReservation(2, ReservationAction.RESERVE),
        ],
      } as unknown as Concert;

      concertsRepo.findOne.mockResolvedValue(concert);
      await expect(service.reserve(3, 1)).rejects.toThrow(BadRequestException);
    });

    it('should allow reservation when a cancelled seat frees up capacity', async () => {
      const t1 = new Date('2024-01-01T10:00:00Z');
      const t2 = new Date('2024-01-01T11:00:00Z');
      const concert = {
        id: 1,
        totalSeats: 1,
        reservations: [
          makeReservation(1, ReservationAction.RESERVE, t1),
          makeReservation(1, ReservationAction.CANCEL, t2),
        ],
      } as unknown as Concert;

      const savedRow = { id: 5, userId: 2, concertId: 1, action: ReservationAction.RESERVE };
      concertsRepo.findOne.mockResolvedValue(concert);
      reservationsRepo.create.mockReturnValue(savedRow);
      reservationsRepo.save.mockResolvedValue(savedRow);

      const result = await service.reserve(2, 1);
      expect(result.action).toBe(ReservationAction.RESERVE);
    });
  });

  describe('cancel', () => {
    it('should successfully cancel a reservation', async () => {
      const concert = {
        id: 1,
        totalSeats: 100,
        reservations: [makeReservation(10, ReservationAction.RESERVE)],
      } as unknown as Concert;

      const savedRow = { id: 2, userId: 10, concertId: 1, action: ReservationAction.CANCEL };
      concertsRepo.findOne.mockResolvedValue(concert);
      reservationsRepo.create.mockReturnValue(savedRow);
      reservationsRepo.save.mockResolvedValue(savedRow);

      const result = await service.cancel(10, 1);
      expect(result.action).toBe(ReservationAction.CANCEL);
    });

    it('should throw NotFoundException if concert does not exist', async () => {
      concertsRepo.findOne.mockResolvedValue(null);
      await expect(service.cancel(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user has no active reservation', async () => {
      const concert = { id: 1, totalSeats: 100, reservations: [] } as unknown as Concert;
      concertsRepo.findOne.mockResolvedValue(concert);
      await expect(service.cancel(10, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if the last action was already a cancel', async () => {
      const t1 = new Date('2024-01-01T10:00:00Z');
      const t2 = new Date('2024-01-01T11:00:00Z');
      const concert = {
        id: 1,
        totalSeats: 100,
        reservations: [
          makeReservation(10, ReservationAction.RESERVE, t1),
          makeReservation(10, ReservationAction.CANCEL, t2),
        ],
      } as unknown as Concert;

      concertsRepo.findOne.mockResolvedValue(concert);
      await expect(service.cancel(10, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAllHistory', () => {
    it('should return formatted history for all users', async () => {
      const now = new Date();
      reservationsRepo.find.mockResolvedValue([
        { id: 1, createdAt: now, action: ReservationAction.RESERVE, user: { fullName: 'Alice' }, concert: { name: 'Rock Fest' } },
        { id: 2, createdAt: now, action: ReservationAction.CANCEL, user: { fullName: 'Bob' }, concert: { name: 'Jazz Night' } },
      ]);

      const result = await service.getAllHistory();
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ username: 'Alice', concertName: 'Rock Fest', action: 'Reserve' });
      expect(result[1]).toMatchObject({ username: 'Bob', concertName: 'Jazz Night', action: 'Cancel' });
    });

    it('should return empty array when no reservations exist', async () => {
      reservationsRepo.find.mockResolvedValue([]);
      const result = await service.getAllHistory();
      expect(result).toEqual([]);
    });
  });

  describe('getUserHistory', () => {
    it('should return only the requesting user history', async () => {
      const now = new Date();
      reservationsRepo.find.mockResolvedValue([
        { id: 3, createdAt: now, action: ReservationAction.RESERVE, concert: { name: 'Rock Fest' } },
      ]);

      const result = await service.getUserHistory(10);
      expect(reservationsRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 10 } }),
      );
      expect(result[0]).toMatchObject({ concertName: 'Rock Fest', action: 'Reserve' });
    });
  });
});
