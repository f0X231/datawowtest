import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationAction } from '../reservations/entities/reservation.entity';
import { CreateConcertDto } from './dto/create-concert.dto';
import { Concert } from './entities/concert.entity';

@Injectable()
export class ConcertsService {
  constructor(
    @InjectRepository(Concert)
    private concertsRepository: Repository<Concert>,
  ) {}

  async create(dto: CreateConcertDto): Promise<Concert> {
    const concert = this.concertsRepository.create({
      name: dto.name,
      description: dto.description ?? '',
      totalSeats: dto.totalSeats,
    });
    return this.concertsRepository.save(concert);
  }

  async findAll(): Promise<Concert[]> {
    return this.concertsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findAllWithSeats(userId?: number) {
    const concerts = await this.concertsRepository.find({
      relations: { reservations: true },
      order: { createdAt: 'DESC' },
    });

    return concerts.map((concert) => {
      const activeReservations = this.countActiveReservations(concert.reservations);
      const availableSeats = concert.totalSeats - activeReservations;

      let userReserved = false;
      if (userId) {
        userReserved = this.isUserReserved(concert.reservations, userId);
      }

      return {
        id: concert.id,
        name: concert.name,
        description: concert.description,
        totalSeats: concert.totalSeats,
        availableSeats,
        reservedCount: activeReservations,
        userReserved,
        createdAt: concert.createdAt,
      };
    });
  }

  async getStats() {
    const concerts = await this.concertsRepository.find({
      relations: { reservations: true },
    });

    let totalSeats = 0;
    let totalReserved = 0;
    let totalCancelled = 0;

    for (const concert of concerts) {
      totalSeats += concert.totalSeats;
      for (const r of concert.reservations) {
        if (r.action === ReservationAction.RESERVE) totalReserved++;
        if (r.action === ReservationAction.CANCEL) totalCancelled++;
      }
    }

    return { totalSeats, totalReserved, totalCancelled };
  }

  async remove(id: number): Promise<void> {
    const concert = await this.concertsRepository.findOne({ where: { id } });
    if (!concert) throw new NotFoundException('Concert not found');
    await this.concertsRepository.remove(concert);
  }

  private countActiveReservations(reservations: { userId: number; action: ReservationAction; createdAt: Date }[]): number {
    const latestPerUser = new Map<number, ReservationAction>();
    const sorted = [...reservations].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    for (const r of sorted) {
      latestPerUser.set(r.userId, r.action);
    }
    let count = 0;
    for (const action of latestPerUser.values()) {
      if (action === ReservationAction.RESERVE) count++;
    }
    return count;
  }

  private isUserReserved(reservations: { userId: number; action: ReservationAction; createdAt: Date }[], userId: number): boolean {
    const userReservations = reservations
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (userReservations.length === 0) return false;
    return userReservations[userReservations.length - 1].action === ReservationAction.RESERVE;
  }
}
