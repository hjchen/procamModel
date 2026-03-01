import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { AbilityService } from './ability.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ability')
@UseGuards(JwtAuthGuard)
export class AbilityController {
  constructor(private readonly abilityService: AbilityService) {}

  @Get('my-scores')
  async getMyScores(@Request() req) {
    return this.abilityService.getMyScores(req.user.userId);
  }

  @Put('my-scores')
  async updateMyScores(@Request() req, @Body() scores: any) {
    return this.abilityService.updateMyScores(req.user.userId, scores);
  }
}
