import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Post('reserve/:concertId')
  @Roles(UserRole.USER)
  reserve(
    @Request() req: { user: { id: number } },
    @Param('concertId', ParseIntPipe) concertId: number,
  ) {
    return this.reservationsService.reserve(req.user.id, concertId);
  }

  @Post('cancel/:concertId')
  @Roles(UserRole.USER)
  cancel(
    @Request() req: { user: { id: number } },
    @Param('concertId', ParseIntPipe) concertId: number,
  ) {
    return this.reservationsService.cancel(req.user.id, concertId);
  }

  @Get('history/me')
  @Roles(UserRole.USER)
  getHistoryMe(@Request() req: { user: { id: number } }) {
    return this.reservationsService.getUserHistory(req.user.id);
  }

  @Get('history')
  @Roles(UserRole.ADMIN)
  getHistoryAll() {
    return this.reservationsService.getAllHistory();
  }
}
