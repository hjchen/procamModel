import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Department[]> {
    try {
      console.log('Fetching all departments...');
      const departments = await this.departmentsRepository.find();
      console.log('Found departments:', departments);
      return departments;
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<any> {
    const department = await this.departmentsRepository.findOne({
      where: { id }
    });
    if (!department) {
      throw new NotFoundException('部门不存在');
    }
    const members = await this.usersRepository.find({
      where: { departmentId: id }
    });
    return { ...department, members };
  }

  async getMembers(id: number): Promise<User[]> {
    const department = await this.findOne(id);
    return this.usersRepository.find({
      where: { departmentId: id },
      relations: ['role']
    });
  }

  async create(departmentData: {
    name: string;
    description?: string;
    managerId?: number;
  }): Promise<Department> {
    const department = this.departmentsRepository.create(departmentData);
    return this.departmentsRepository.save(department);
  }

  async update(id: number, departmentData: {
    name?: string;
    description?: string;
    managerId?: number;
  }): Promise<Department> {
    const department = await this.findOne(id);

    if (departmentData.name !== undefined) {
      department.name = departmentData.name;
    }
    if (departmentData.description !== undefined) {
      department.description = departmentData.description;
    }
    if (departmentData.managerId !== undefined) {
      department.managerId = departmentData.managerId;
    }

    return this.departmentsRepository.save(department);
  }

  async updateMembers(id: number, memberIds: number[]): Promise<Department> {
    const department = await this.findOne(id);

    // 清除旧成员的部门关联
    await this.usersRepository.update(
      { departmentId: id },
      { departmentId: null }
    );

    // 设置新成员的部门关联
    if (memberIds.length > 0) {
      await this.usersRepository.update(
        memberIds,
        { departmentId: id }
      );
    }

    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const department = await this.findOne(id);

    // 清除成员的部门关联
    await this.usersRepository.update(
      { departmentId: id },
      { departmentId: null }
    );

    await this.departmentsRepository.remove(department);
  }
}
