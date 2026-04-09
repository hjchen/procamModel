import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SectionService } from './section.service';

@Controller('sections')
@UseGuards(AuthGuard('jwt'))
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Get()
  async findByDepartment(
    @Query('departmentId', ParseIntPipe) departmentId: number,
  ) {
    return this.sectionService.findByDepartment(departmentId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sectionService.findOne(id);
  }

  @Post()
  async create(
    @Body()
    createSectionDto: {
      name: string;
      description?: string;
      departmentId: number;
    },
  ) {
    return this.sectionService.create(createSectionDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateSectionDto: {
      name?: string;
      description?: string;
    },
  ) {
    return this.sectionService.update(id, updateSectionDto);
  }

  @Put(':id/members')
  async updateMembers(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateMembersDto: {
      memberIds: number[];
    },
  ) {
    return this.sectionService.updateMembers(id, updateMembersDto.memberIds);
  }

  @Post(':id/members')
  async addMembers(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    addMembersDto: {
      memberIds: number[];
    },
  ) {
    return this.sectionService.addMembers(id, addMembersDto.memberIds);
  }

  @Delete(':id/members')
  async removeMembers(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    removeMembersDto: {
      memberIds: number[];
    },
  ) {
    return this.sectionService.removeMembers(id, removeMembersDto.memberIds);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.sectionService.delete(id);
    return { message: '删除成功' };
  }
}
