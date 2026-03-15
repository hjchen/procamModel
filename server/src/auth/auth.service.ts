import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly allowedPagePermissions = new Set([
    'page:positions',
    'page:ranks',
    'page:departments',
    'page:roles',
    'page:personal',
    'page:group-peer-review',
    'page:team',
  ]);
  private readonly permissionByPath: Record<string, string> = {
    '/positions': 'page:positions',
    '/ranks': 'page:ranks',
    '/departments': 'page:departments',
    '/roles': 'page:roles',
    '/personal': 'page:personal',
    '/group-peer-review': 'page:group-peer-review',
    '/team': 'page:team',
  };
  private readonly defaultRolePermissions: Record<string, string[]> = {
    admin: [
      'page:positions',
      'page:ranks',
      'page:departments',
      'page:roles',
      'page:personal',
      'page:group-peer-review',
      'page:team',
    ],
    hr: [
      'page:positions',
      'page:ranks',
      'page:departments',
      'page:roles',
      'page:team',
    ],
    manager: ['page:personal', 'page:group-peer-review', 'page:team'],
    analyst: ['page:personal', 'page:team'],
    evaluator: ['page:personal', 'page:group-peer-review'],
    employee: ['page:personal', 'page:group-peer-review'],
  };

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { username },
      relations: ['role', 'role.permissions'],
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('密码错误');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('用户已被禁用');
    }

    const rolePermissions = (user.role?.permissions || []).map(
      (permission) => permission.name,
    );
    const rolePagePermissionsByPath = (user.role?.permissions || [])
      .map((permission) => this.permissionByPath[permission.path || ''])
      .filter(Boolean);
    const userPagePermissions = (user.permissions || []).filter((permission) =>
      this.allowedPagePermissions.has(permission),
    );
    const rolePagePermissionsByName = rolePermissions.filter((permission) =>
      this.allowedPagePermissions.has(permission),
    );
    const roleDefaultPermissions =
      this.defaultRolePermissions[user.role?.name || ''] || [];
    const permissionSource =
      userPagePermissions.length > 0
        ? userPagePermissions
        : rolePagePermissionsByName.length > 0
          ? rolePagePermissionsByName
          : rolePagePermissionsByPath.length > 0
            ? rolePagePermissionsByPath
            : roleDefaultPermissions;
    const effectivePermissions = Array.from(
      new Set(
        permissionSource.filter((permission) =>
          this.allowedPagePermissions.has(permission),
        ),
      ),
    );

    const { password: _, role, ...result } = user;
    return {
      ...result,
      role: role?.name || 'employee',
      permissions: effectivePermissions,
    };
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    };
  }

  async register(
    username: string,
    password: string,
    name: string,
    email: string,
    roleId: number,
  ) {
    const existingUser = await this.usersRepository.findOne({
      where: { username },
    });
    if (existingUser) {
      throw new UnauthorizedException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.usersRepository.create({
      username,
      password: hashedPassword,
      name,
      email,
      roleId,
      permissions: [],
    });

    return this.usersRepository.save(newUser);
  }

  async logout() {
    // JWT是无状态的，退出登录只需要客户端删除token即可
    return { message: '退出登录成功' };
  }
}
