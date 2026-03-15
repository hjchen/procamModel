import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group, User, Department])],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}