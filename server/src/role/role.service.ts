import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({ relations: ['permissions'] });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.rolesRepository.findOne({ 
      where: { id },
      relations: ['permissions'] 
    });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    return role;
  }

  async create(roleData: {
    name: string;
    description: string;
    permissionIds: number[];
  }): Promise<Role> {
    const permissions = await this.permissionsRepository.findByIds(roleData.permissionIds);
    const role = this.rolesRepository.create({
      name: roleData.name,
      description: roleData.description,
      permissions,
    });
    return this.rolesRepository.save(role);
  }

  async update(id: number, roleData: {
    name?: string;
    description?: string;
    permissionIds?: number[];
  }): Promise<Role> {
    const role = await this.findOne(id);

    if (roleData.name !== undefined) {
      role.name = roleData.name;
    }
    if (roleData.description !== undefined) {
      role.description = roleData.description;
    }
    if (roleData.permissionIds !== undefined) {
      const permissions = await this.permissionsRepository.findByIds(roleData.permissionIds);
      role.permissions = permissions;
    }

    return this.rolesRepository.save(role);
  }

  async delete(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.rolesRepository.remove(role);
  }

  async getPermissions(): Promise<Permission[]> {
    return this.permissionsRepository.find();
  }
}
