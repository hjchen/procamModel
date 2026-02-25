import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RankService } from './rank.service';
import { Rank } from '../entities/rank.entity';

@Controller('ranks')
@UseGuards(AuthGuard('jwt'))
export class RankController {
  constructor(private readonly rankService: RankService) {}

  @Get()
  findAll() {
    return this.rankService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.rankService.findOne(id);
  }

  @Post()
  create(@Body() rankData: {
    category: 'F' | 'E';
    level: string;
    name: string;
    years: string;
    description: string;
  }) {
    return this.rankService.create(rankData);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() rankData: {
    name: string;
    years: string;
    description: string;
  }) {
    return this.rankService.update(id, rankData);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.rankService.delete(id);
  }
}
