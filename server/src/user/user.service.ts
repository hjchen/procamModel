import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['role'] });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role']
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
    const existingUser = await this.usersRepository.findOne({ where: { username: userData.username } });
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

  async update(id: number, userData: {
    name: string;
    email: string;
    roleId: number;
  }): Promise<User> {
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

  async batchCreate(usersData: Array<{
    username: string;
    name: string;
    email: string;
  }>, roleId: number): Promise<User[]> {
    const createdUsers: User[] = [];

    for (const userData of usersData) {
      const existingUser = await this.usersRepository.findOne({ where: { username: userData.username } });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.username, 10); // 密码默认为用户名
        const user = this.usersRepository.create({
          username: userData.username,
          password: hashedPassword,
          name: userData.name,
          email: userData.email,
          roleId,
          permissions: [],
        });
        const savedUser = await this.usersRepository.save(user);
        createdUsers.push(savedUser);
      }
    }

    return createdUsers;
  }
}
