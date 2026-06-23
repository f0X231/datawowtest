import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Concert } from '../../concerts/entities/concert.entity';
import { User } from '../../users/entities/user.entity';

export enum ReservationAction {
  RESERVE = 'reserve',
  CANCEL = 'cancel',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'concert_id' })
  concertId: number;

  @Column({ type: 'enum', enum: ReservationAction })
  action: ReservationAction;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.reservations)
  user: User;

  @ManyToOne(() => Concert, (concert) => concert.reservations)
  concert: Concert;
}
