import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../config/typeorm.config';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ConcertsModule } from '../concerts/concerts.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
    }),
    AuthModule,
    UsersModule,
    ConcertsModule,
    ReservationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

