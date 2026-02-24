import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleService } from './role.service';
import { Role } from '../entities/role.entity';

@Controller('roles')
@UseGuards(AuthGuard('jwt'))
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  async findAll(): Promise<Role[]> {
    return this.roleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Role> {
    return this.roleService.findOne(id);
  }

  @Post()
  async create(@Body() roleData: {
    name: string;
    description: string;
    permissionIds: number[];
  }): Promise<Role> {
    return this.roleService.create(roleData);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() roleData: {
    name: string;
    description: string;
    permissionIds: number[];
  }): Promise<Role> {
    return this.roleService.update(id, roleData);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.roleService.delete(id);
  }

  @Get('permissions/all')
  async getPermissions() {
    return this.roleService.getPermissions();
  }
}
