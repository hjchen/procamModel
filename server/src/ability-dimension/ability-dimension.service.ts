import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbilityDimension } from '../entities/ability-dimension.entity';

@Injectable()
export class AbilityDimensionService {
  constructor(
    @InjectRepository(AbilityDimension)
    private abilityDimensionsRepository: Repository<AbilityDimension>,
  ) {}

  async create(dimensionData: {
    code: string;
    title: string;
    description: string;
    scores: Record<string, number>;
    positionId: number;
  }): Promise<AbilityDimension> {
    const dimension = this.abilityDimensionsRepository.create(dimensionData);
    return this.abilityDimensionsRepository.save(dimension);
  }

  async update(id: number, dimensionData: {
    title: string;
    description: string;
    scores: Record<string, number>;
  }): Promise<AbilityDimension> {
    const dimension = await this.abilityDimensionsRepository.findOne({ where: { id } });
    if (!dimension) {
      throw new NotFoundException('能力维度不存在');
    }

    dimension.title = dimensionData.title;
    dimension.description = dimensionData.description;
    dimension.scores = dimensionData.scores;

    return this.abilityDimensionsRepository.save(dimension);
  }

  async delete(id: number): Promise<void> {
    const dimension = await this.abilityDimensionsRepository.findOne({ where: { id } });
    if (!dimension) {
      throw new NotFoundException('能力维度不存在');
    }
    await this.abilityDimensionsRepository.remove(dimension);
  }
}
