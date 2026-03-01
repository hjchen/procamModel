import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AbilityDimensionService } from './ability-dimension.service';

@Controller('ability-dimensions')
@UseGuards(AuthGuard('jwt'))
export class AbilityDimensionController {
  constructor(private abilityDimensionService: AbilityDimensionService) {}

  @Post()
  async create(@Body() dimensionData: {
    code: string;
    title: string;
    description: string;
    scores: Record<string, number>;
    positionId: number;
  }) {
    return this.abilityDimensionService.create(dimensionData);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dimensionData: {
    title: string;
    description: string;
    scores: Record<string, number>;
  }) {
    return this.abilityDimensionService.update(id, dimensionData);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.abilityDimensionService.delete(id);
  }
}
