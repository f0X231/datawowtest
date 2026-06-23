import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Concert } from '../concerts/entities/concert.entity';
import { Reservation, ReservationAction } from './entities/reservation.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepo: Repository<Reservation>,
    @InjectRepository(Concert)
    private concertsRepo: Repository<Concert>,
  ) {}

  async reserve(userId: number, concertId: number): Promise<Reservation> {
    const concert = await this.concertsRepo.findOne({
      where: { id: concertId },
      relations: { reservations: true },
    });
    if (!concert) throw new NotFoundException('Concert not found');

    const latestAction = this.getLatestUserAction(concert.reservations, userId);
    if (latestAction === ReservationAction.RESERVE) {
      throw new BadRequestException('You already have a reservation for this concert');
    }

    const activeCount = this.countActive(concert.reservations);
    if (activeCount >= concert.totalSeats) {
      throw new BadRequestException('No seats available');
    }

    const reservation = this.reservationsRepo.create({
      userId,
      concertId,
      action: ReservationAction.RESERVE,
    });
    return this.reservationsRepo.save(reservation);
  }

  async cancel(userId: number, concertId: number): Promise<Reservation> {
    const concert = await this.concertsRepo.findOne({
      where: { id: concertId },
      relations: { reservations: true },
    });
    if (!concert) throw new NotFoundException('Concert not found');

    const latestAction = this.getLatestUserAction(concert.reservations, userId);
    if (latestAction !== ReservationAction.RESERVE) {
      throw new BadRequestException('No active reservation to cancel');
    }

    const reservation = this.reservationsRepo.create({
      userId,
      concertId,
      action: ReservationAction.CANCEL,
    });
    return this.reservationsRepo.save(reservation);
  }

  async getAllHistory() {
    const rows = await this.reservationsRepo.find({
      relations: { user: true, concert: true },
      order: { createdAt: 'DESC' },
    });

    return rows.map((r) => ({
      id: r.id,
      datetime: r.createdAt,
      username: r.user?.fullName ?? 'Unknown',
      concertName: r.concert?.name ?? 'Unknown',
      action: r.action === ReservationAction.RESERVE ? 'Reserve' : 'Cancel',
    }));
  }

  async getUserHistory(userId: number) {
    const rows = await this.reservationsRepo.find({
      where: { userId },
      relations: { concert: true },
      order: { createdAt: 'DESC' },
    });

    return rows.map((r) => ({
      id: r.id,
      datetime: r.createdAt,
      concertName: r.concert?.name ?? 'Unknown',
      action: r.action === ReservationAction.RESERVE ? 'Reserve' : 'Cancel',
    }));
  }

  private getLatestUserAction(
    reservations: { userId: number; action: ReservationAction; createdAt: Date }[],
    userId: number,
  ): ReservationAction | null {
    const userRows = reservations
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (userRows.length === 0) return null;
    return userRows[userRows.length - 1].action;
  }

  private countActive(
    reservations: { userId: number; action: ReservationAction; createdAt: Date }[],
  ): number {
    const latestPerUser = new Map<number, ReservationAction>();
    const sorted = [...reservations].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    for (const r of sorted) latestPerUser.set(r.userId, r.action);
    let count = 0;
    for (const action of latestPerUser.values()) {
      if (action === ReservationAction.RESERVE) count++;
    }
    return count;
  }
}
