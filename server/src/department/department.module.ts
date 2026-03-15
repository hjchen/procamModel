import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { Department } from '../entities/department.entity';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { GroupPeerReview } from '../entities/group-peer-review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Department, User, Group, GroupPeerReview]),
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
