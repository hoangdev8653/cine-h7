import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role.guard';
import { Roles } from '../../common/enum/user.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('statistics')
@Roles('ADMIN')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) { }

  @Get('overview')
  async getOverview() {
    return await this.statisticsService.getOverview();
  }

  @Get('revenue')
  async getRevenue(@Query('period') period: 'daily' | 'weekly' | 'monthly') {
    return await this.statisticsService.getRevenue(period);
  }

  @Get('top-movies')
  async getTopMovies(@Query('limit') limit: string) {
    return await this.statisticsService.getTopMovies(Number(limit) || 5);
  }

  @Get('orders')
  async getOrders(@Query('period') period: 'daily' | 'weekly' | 'monthly') {
    return await this.statisticsService.getOrders(period);
  }
}
