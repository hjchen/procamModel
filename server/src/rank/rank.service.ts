import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rank } from '../entities/rank.entity';

@Injectable()
export class RankService {
  constructor(
    @InjectRepository(Rank)
    private ranksRepository: Repository<Rank>,
  ) {}

  async findAll(): Promise<Rank[]> {
    return this.ranksRepository.find();
  }

  async findOne(id: number): Promise<Rank> {
    const rank = await this.ranksRepository.findOne({ where: { id } });
    if (!rank) {
      throw new NotFoundException('职级不存在');
    }
    return rank;
  }

  async create(rankData: {
    category: 'F' | 'E';
    level: string;
    name: string;
    years: string;
    description: string;
  }): Promise<Rank> {
    const rank = this.ranksRepository.create(rankData);
    return this.ranksRepository.save(rank);
  }

  async update(id: number, rankData: {
    name: string;
    years: string;
    description: string;
  }): Promise<Rank> {
    const rank = await this.findOne(id);
    rank.name = rankData.name;
    rank.years = rankData.years;
    rank.description = rankData.description;
    return this.ranksRepository.save(rank);
  }

  async delete(id: number): Promise<void> {
    const rank = await this.findOne(id);
    await this.ranksRepository.remove(rank);
  }
}
