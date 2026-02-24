import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from '../entities/position.entity';
import { AbilityDimension } from '../entities/ability-dimension.entity';
import { PositionService } from './position.service';
import { PositionController } from './position.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Position, AbilityDimension])],
  controllers: [PositionController],
  providers: [PositionService],
  exports: [PositionService],
})
export class PositionModule {}
