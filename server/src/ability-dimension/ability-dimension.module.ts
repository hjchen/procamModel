import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbilityDimensionController } from './ability-dimension.controller';
import { AbilityDimensionService } from './ability-dimension.service';
import { AbilityDimension } from '../entities/ability-dimension.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AbilityDimension])],
  controllers: [AbilityDimensionController],
  providers: [AbilityDimensionService],
  exports: [AbilityDimensionService],
})
export class AbilityDimensionModule {}
