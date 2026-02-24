import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from '../entities/position.entity';
import { AbilityDimension } from '../entities/ability-dimension.entity';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position)
    private positionsRepository: Repository<Position>,
    @InjectRepository(AbilityDimension)
    private abilityDimensionsRepository: Repository<AbilityDimension>,
  ) {}

  async findAll(): Promise<Position[]> {
    return this.positionsRepository.find({ relations: ['abilityDimensions'] });
  }

  async findOne(id: number): Promise<Position> {
    const position = await this.positionsRepository.findOne({ 
      where: { id },
      relations: ['abilityDimensions'] 
    });
    if (!position) {
      throw new NotFoundException('岗位不存在');
    }
    return position;
  }

  async create(positionData: {
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
  }): Promise<Position> {
    const existingPosition = await this.positionsRepository.findOne({ where: { code: positionData.code } });
    if (existingPosition) {
      throw new NotFoundException('岗位编码已存在');
    }

    const position = this.positionsRepository.create({
      code: positionData.code,
      name: positionData.name,
      dimensions: positionData.dimensions,
      ranks: positionData.ranks,
      status: positionData.status,
    });

    const savedPosition = await this.positionsRepository.save(position);

    // 创建能力维度
    for (const dimensionData of positionData.abilityDimensions) {
      const dimension = this.abilityDimensionsRepository.create({
        code: dimensionData.code,
        title: dimensionData.title,
        description: dimensionData.description,
        scores: dimensionData.scores,
        positionId: savedPosition.id,
      });
      await this.abilityDimensionsRepository.save(dimension);
    }

    return this.findOne(savedPosition.id);
  }

  async update(id: number, positionData: {
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
  }): Promise<Position> {
    const position = await this.findOne(id);
    position.name = positionData.name;
    position.dimensions = positionData.dimensions;
    position.ranks = positionData.ranks;
    position.status = positionData.status;

    await this.positionsRepository.save(position);

    // 更新能力维度
    // 先删除旧的能力维度
    await this.abilityDimensionsRepository.delete({ positionId: id });

    // 创建新的能力维度
    for (const dimensionData of positionData.abilityDimensions) {
      const dimension = this.abilityDimensionsRepository.create({
        code: dimensionData.code,
        title: dimensionData.title,
        description: dimensionData.description,
        scores: dimensionData.scores,
        positionId: id,
      });
      await this.abilityDimensionsRepository.save(dimension);
    }

    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const position = await this.findOne(id);
    // 先删除关联的能力维度
    await this.abilityDimensionsRepository.delete({ positionId: id });
    // 再删除岗位
    await this.positionsRepository.remove(position);
  }
}
