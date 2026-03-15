import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['role'] });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async create(userData: {
    username: string;
    password: string;
    name: string;
    email: string;
    roleId: number;
  }): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { username: userData.username },
    });
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.usersRepository.create({
      username: userData.username,
      password: hashedPassword,
      name: userData.name,
      email: userData.email,
      roleId: userData.roleId,
      permissions: [],
    });
    return this.usersRepository.save(user);
  }

  async update(
    id: number,
    userData: {
      name: string;
      email: string;
      roleId: number;
    },
  ): Promise<User> {
    const user = await this.findOne(id);
    user.name = userData.name;
    user.email = userData.email;
    user.roleId = userData.roleId;
    return this.usersRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async batchCreate(
    usersData: Array<{
      username: string;
      name: string;
      email: string;
      positionId: number;
      rank: string;
    }>,
    roleId: number,
  ): Promise<User[]> {
    const createdUsers: User[] = [];

    for (const userData of usersData) {
      const existingUser = await this.usersRepository.findOne({
        where: { username: userData.username },
      });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.username, 10);
        const user = this.usersRepository.create({
          username: userData.username,
          password: hashedPassword,
          name: userData.name,
          email: userData.email,
          roleId,
          positionId: userData.positionId,
          rank: userData.rank,
          permissions: [],
        });
        const savedUser = await this.usersRepository.save(user);
        createdUsers.push(savedUser);
      }
    }

    return createdUsers;
  }

  async updateScores(
    operatorUserId: number,
    id: number,
    abilityScores: Record<string, number>,
  ): Promise<User> {
    const operatorUser = await this.findOne(operatorUserId);
    const user = await this.findOne(id);

    if (!user.departmentId) {
      throw new ForbiddenException('成员未归属部门，无法进行管理者评分');
    }

    // 检查操作者是否有评分权限
    let hasPermission = false;

    // 1. 系统管理员、HR有全局评分权限
    if (
      operatorUser.role?.name === 'admin' ||
      operatorUser.role?.name === 'hr'
    ) {
      hasPermission = true;
    }

    // 2. 检查是否为该成员所属部门的管理者
    if (!hasPermission) {
      const department = await this.departmentsRepository.findOne({
        where: { id: user.departmentId },
      });

      if (department && department.managerId === operatorUserId) {
        hasPermission = true;
      }
    }

    // 3. manager角色也有评分权限（向下兼容）
    if (!hasPermission && operatorUser.role?.name === 'manager') {
      hasPermission = true;
    }

    if (!hasPermission) {
      throw new ForbiddenException('您没有权限对该成员进行评分');
    }

    user.managerAbilityScores = abilityScores;
    user.abilityScores = abilityScores as any;
    return this.usersRepository.save(user);
  }
}
