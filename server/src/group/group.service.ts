import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  async findByDepartment(departmentId: number): Promise<Group[]> {
    return this.groupsRepository.find({
      where: { departmentId },
      relations: ['members'],
    });
  }

  async findOne(id: number): Promise<Group> {
    const group = await this.groupsRepository.findOne({
      where: { id },
      relations: ['members', 'department'],
    });
    if (!group) {
      throw new NotFoundException('分组不存在');
    }
    return group;
  }

  async create(groupData: {
    name: string;
    description?: string;
    departmentId: number;
  }): Promise<Group> {
    // 验证部门是否存在
    const department = await this.departmentsRepository.findOne({
      where: { id: groupData.departmentId }
    });
    if (!department) {
      throw new BadRequestException('部门不存在');
    }

    // 检查同一部门下分组名称是否重复
    const existingGroup = await this.groupsRepository.findOne({
      where: {
        name: groupData.name,
        departmentId: groupData.departmentId
      }
    });
    if (existingGroup) {
      throw new BadRequestException('该部门下已存在同名分组');
    }

    const group = this.groupsRepository.create(groupData);
    return this.groupsRepository.save(group);
  }

  async update(id: number, groupData: {
    name?: string;
    description?: string;
  }): Promise<Group> {
    const group = await this.findOne(id);

    if (groupData.name) {
      // 检查同一部门下分组名称是否重复
      const existingGroup = await this.groupsRepository.findOne({
        where: {
          name: groupData.name,
          departmentId: group.departmentId
        }
      });
      if (existingGroup && existingGroup.id !== id) {
        throw new BadRequestException('该部门下已存在同名分组');
      }
      group.name = groupData.name;
    }

    if (groupData.description !== undefined) {
      group.description = groupData.description;
    }

    return this.groupsRepository.save(group);
  }

  async addMembers(groupId: number, memberIds: number[]): Promise<Group> {
    const group = await this.findOne(groupId);

    if (memberIds.length === 0) {
      return group;
    }

    // 验证用户是否存在且属于同一部门
    const users = await this.usersRepository.find({
      where: memberIds.map(id => ({ id })),
    });

    if (users.length !== memberIds.length) {
      throw new BadRequestException('部分用户不存在');
    }

    // 检查用户是否属于同一部门
    const departmentUsers = users.filter(user => user.departmentId === group.departmentId);
    if (departmentUsers.length !== users.length) {
      throw new BadRequestException('只能添加同一部门的成员');
    }

    // 获取当前成员ID列表
    const currentMemberIds = group.members.map(m => m.id);

    // 过滤掉已经在分组中的成员
    const newMemberIds = memberIds.filter(id => !currentMemberIds.includes(id));

    if (newMemberIds.length === 0) {
      return group;
    }

    const newMembers = users.filter(user => newMemberIds.includes(user.id));
    group.members = [...group.members, ...newMembers];

    return this.groupsRepository.save(group);
  }

  async removeMembers(groupId: number, memberIds: number[]): Promise<Group> {
    const group = await this.findOne(groupId);

    if (memberIds.length === 0) {
      return group;
    }

    // 过滤掉要移除的成员
    group.members = group.members.filter(member => !memberIds.includes(member.id));

    return this.groupsRepository.save(group);
  }

  async updateMembers(groupId: number, memberIds: number[]): Promise<Group> {
    const group = await this.findOne(groupId);

    if (memberIds.length === 0) {
      group.members = [];
    } else {
      // 验证用户是否存在且属于同一部门
      const users = await this.usersRepository.find({
        where: memberIds.map(id => ({ id })),
      });

      if (users.length !== memberIds.length) {
        throw new BadRequestException('部分用户不存在');
      }

      // 检查用户是否属于同一部门
      const departmentUsers = users.filter(user => user.departmentId === group.departmentId);
      if (departmentUsers.length !== users.length) {
        throw new BadRequestException('只能添加同一部门的成员');
      }

      group.members = users;
    }

    return this.groupsRepository.save(group);
  }

  async delete(id: number): Promise<void> {
    const group = await this.findOne(id);
    await this.groupsRepository.remove(group);
  }
}