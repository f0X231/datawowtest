import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Concert } from '../concerts/entities/concert.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { User } from '../users/entities/user.entity';
import { InitialMigration1719183920000 } from '../migrations/1719183920000-InitialMigration';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Concert, Reservation],
  migrations: [InitialMigration1719183920000],
  migrationsRun: true,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

