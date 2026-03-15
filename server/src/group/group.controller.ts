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
} from '@nestjs/common';
import { GroupService } from './group.service';

@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  async findByDepartment(@Query('departmentId', ParseIntPipe) departmentId: number) {
    return this.groupService.findByDepartment(departmentId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.findOne(id);
  }

  @Post()
  async create(@Body() createGroupDto: {
    name: string;
    description?: string;
    departmentId: number;
  }) {
    return this.groupService.create(createGroupDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: {
      name?: string;
      description?: string;
    }
  ) {
    return this.groupService.update(id, updateGroupDto);
  }

  @Put(':id/members')
  async updateMembers(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMembersDto: {
      memberIds: number[];
    }
  ) {
    return this.groupService.updateMembers(id, updateMembersDto.memberIds);
  }

  @Post(':id/members')
  async addMembers(
    @Param('id', ParseIntPipe) id: number,
    @Body() addMembersDto: {
      memberIds: number[];
    }
  ) {
    return this.groupService.addMembers(id, addMembersDto.memberIds);
  }

  @Delete(':id/members')
  async removeMembers(
    @Param('id', ParseIntPipe) id: number,
    @Body() removeMembersDto: {
      memberIds: number[];
    }
  ) {
    return this.groupService.removeMembers(id, removeMembersDto.memberIds);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.groupService.delete(id);
    return { message: '删除成功' };
  }
}