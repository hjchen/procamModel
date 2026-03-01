import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbilityController } from './ability.controller';
import { AbilityService } from './ability.service';
import { User } from '../entities/user.entity';
import { Position } from '../entities/position.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Position])],
  controllers: [AbilityController],
  providers: [AbilityService],
})
export class AbilityModule {}
