import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rank } from '../entities/rank.entity';
import { RankService } from './rank.service';
import { RankController } from './rank.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Rank])],
  controllers: [RankController],
  providers: [RankService],
  exports: [RankService],
})
export class RankModule {}
