import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Concert } from '../concerts/entities/concert.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { User } from '../users/entities/user.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Concert, Reservation],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
});
