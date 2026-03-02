import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Position } from '../entities/position.entity';
import { AbilityDimension } from '../entities/ability-dimension.entity';

@Injectable()
export class AbilityService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
    @InjectRepository(AbilityDimension)
    private abilityDimensionRepository: Repository<AbilityDimension>,
  ) {}

  async getMyScores(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const position = user.positionId
      ? await this.positionRepository.findOne({
          where: { id: user.positionId },
          relations: ['abilityDimensions'],
        })
      : null;

    const abilityDimensions = position?.abilityDimensions || [];

    const scores = user.abilityScores || {};

    return {
      name: user.name,
      position: user.positionId || '',
      positionName: position ? position.name : '未分配',
      rank: user.rank || '未设置',
      scores,
      abilityDimensions: abilityDimensions.map(dim => ({
        code: dim.code,
        title: dim.title,
        description: dim.description,
        standardScore: dim.scores[user.rank] || 0,
      })),
    };
  }

  async updateMyScores(userId: number, scores: any) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.abilityScores = scores;
    await this.userRepository.save(user);

    return { message: '更新成功', scores };
  }
}
