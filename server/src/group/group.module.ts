import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { Position } from '../entities/position.entity';
import { GroupPeerReview } from '../entities/group-peer-review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      User,
      Department,
      Position,
      GroupPeerReview,
    ]),
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
