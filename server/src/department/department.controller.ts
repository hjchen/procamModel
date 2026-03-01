import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DepartmentService } from './department.service';

@Controller('departments')
@UseGuards(AuthGuard('jwt'))
export class DepartmentController {
  constructor(private departmentService: DepartmentService) {}

  @Get()
  async findAll() {
    return this.departmentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.departmentService.findOne(id);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: number) {
    return this.departmentService.getMembers(id);
  }

  @Post()
  async create(@Body() departmentData: {
    name: string;
    description?: string;
    managerId?: number;
  }) {
    return this.departmentService.create(departmentData);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() departmentData: {
    name?: string;
    description?: string;
    managerId?: number;
  }) {
    return this.departmentService.update(id, departmentData);
  }

  @Put(':id/members')
  async updateMembers(@Param('id') id: number, @Body() data: {
    memberIds: number[];
  }) {
    return this.departmentService.updateMembers(id, data.memberIds);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.departmentService.delete(id);
  }
}
