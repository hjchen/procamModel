import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { PositionService } from './position.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('positions')
@UseGuards(AuthGuard('jwt'))
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get()
  findAll() {
    return this.positionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.positionService.findOne(id);
  }

  @Post()
  create(@Body() positionData: {
    code: string;
    name: string;
    dimensions: number;
    ranks: string;
    status: 'active' | 'inactive';
    abilityDimensions: Array<{
      code: string;
      title: string;
      description: string;
      scores: Record<string, number>;
    }>;
  }) {
    return this.positionService.create(positionData);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() positionData: {
    name: string;
    dimensions: number;
    ranks: string;
    status: 'active' | 'inactive';
    abilityDimensions: Array<{
      id?: number;
      code: string;
      title: string;
      description: string;
      scores: Record<string, number>;
    }>;
  }) {
    return this.positionService.update(id, positionData);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.positionService.delete(id);
  }
}
