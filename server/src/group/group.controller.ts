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
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GroupService } from './group.service';

@Controller('groups')
@UseGuards(AuthGuard('jwt'))
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  async findByDepartment(
    @Query('departmentId', ParseIntPipe) departmentId: number,
  ) {
    return this.groupService.findByDepartment(departmentId);
  }

  @Get('peer-review/targets')
  async getMyPeerReviewTargets(@Request() req: { user: { userId: number } }) {
    return this.groupService.getMyPeerReviewTargets(req.user.userId);
  }

  @Post('peer-review/scores')
  async savePeerReviewScore(
    @Request() req: { user: { userId: number } },
    @Body()
    body: {
      groupId: number;
      targetUserId: number;
      scores: Record<string, number>;
    },
  ) {
    return this.groupService.savePeerReviewScore(req.user.userId, body);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.findOne(id);
  }

  @Post()
  async create(
    @Body()
    createGroupDto: {
      name: string;
      description?: string;
      departmentId: number;
    },
  ) {
    return this.groupService.create(createGroupDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateGroupDto: {
      name?: string;
      description?: string;
    },
  ) {
    return this.groupService.update(id, updateGroupDto);
  }

  @Put(':id/members')
  async updateMembers(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateMembersDto: {
      memberIds: number[];
    },
  ) {
    return this.groupService.updateMembers(id, updateMembersDto.memberIds);
  }

  @Post(':id/members')
  async addMembers(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    addMembersDto: {
      memberIds: number[];
    },
  ) {
    return this.groupService.addMembers(id, addMembersDto.memberIds);
  }

  @Delete(':id/members')
  async removeMembers(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    removeMembersDto: {
      memberIds: number[];
    },
  ) {
    return this.groupService.removeMembers(id, removeMembersDto.memberIds);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.groupService.delete(id);
    return { message: '删除成功' };
  }
}
