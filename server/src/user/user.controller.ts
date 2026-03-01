import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Post()
  async create(@Body() userData: {
    username: string;
    password: string;
    name: string;
    email: string;
    roleId: number;
  }): Promise<User> {
    return this.userService.create(userData);
  }

  @Post('batch')
  async batchCreate(@Body() body: {
    users: Array<{
      username: string;
      name: string;
      email: string;
    }>;
    roleId: number;
  }): Promise<User[]> {
    return this.userService.batchCreate(body.users, body.roleId);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() userData: {
    name: string;
    email: string;
    roleId: number;
  }): Promise<User> {
    return this.userService.update(id, userData);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.userService.delete(id);
  }

  @Put(':id/scores')
  async updateScores(@Param('id') id: number, @Body() body: {
    abilityScores: {
      tech: number;
      engineering: number;
      uiux: number;
      communication: number;
      problem: number;
    };
  }): Promise<User> {
    return this.userService.updateScores(id, body.abilityScores);
  }
}
