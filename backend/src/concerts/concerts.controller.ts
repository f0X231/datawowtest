import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ConcertsService } from './concerts.service';
import { CreateConcertDto } from './dto/create-concert.dto';

@Controller('concerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConcertsController {
  constructor(private concertsService: ConcertsService) {}

  @Get()
  findAll(@Request() req: { user: { id: number; role: UserRole } }) {
    const userId = req.user.role === UserRole.USER ? req.user.id : undefined;
    return this.concertsService.findAllWithSeats(userId);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.concertsService.getStats();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateConcertDto) {
    return this.concertsService.create(dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.concertsService.remove(id);
  }
}
