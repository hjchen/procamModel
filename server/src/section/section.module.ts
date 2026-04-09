import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectionController } from './section.controller';
import { SectionService } from './section.service';
import { Section } from '../entities/section.entity';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Section, User, Department])],
  controllers: [SectionController],
  providers: [SectionService],
  exports: [SectionService],
})
export class SectionModule {}
