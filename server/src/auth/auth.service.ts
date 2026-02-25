import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ 
      where: { username },
      relations: ['role']
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

    const { password: _, role, ...result } = user;
    // 创建一个新的对象，将role转换为字符串
    return {
      ...result,
      role: role?.name || 'employee',
      permissions: user.permissions
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

  async register(username: string, password: string, name: string, email: string, roleId: number) {
    const existingUser = await this.usersRepository.findOne({ where: { username } });
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
