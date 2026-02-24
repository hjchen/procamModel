import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
    @InjectRepository(Permission) private permissionsRepository: Repository<Permission>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async onModuleInit() {
    await this.initializeData();
  }

  async initializeData() {
    // 初始化权限
    const permissions: Array<{
      name: string;
      description: string;
      type: 'page' | 'action';
      path: string;
    }> = [
      { name: 'position:read', description: '查看岗位', type: 'page', path: '/positions' },
      { name: 'position:create', description: '创建岗位', type: 'action', path: '/positions' },
      { name: 'position:update', description: '更新岗位', type: 'action', path: '/positions' },
      { name: 'position:delete', description: '删除岗位', type: 'action', path: '/positions' },
      { name: 'role:read', description: '查看角色', type: 'page', path: '/roles' },
      { name: 'role:create', description: '创建角色', type: 'action', path: '/roles' },
      { name: 'role:update', description: '更新角色', type: 'action', path: '/roles' },
      { name: 'role:delete', description: '删除角色', type: 'action', path: '/roles' },
      { name: 'user:read', description: '查看用户', type: 'page', path: '/users' },
      { name: 'user:create', description: '创建用户', type: 'action', path: '/users' },
      { name: 'user:update', description: '更新用户', type: 'action', path: '/users' },
      { name: 'user:delete', description: '删除用户', type: 'action', path: '/users' },
    ];

    const createdPermissions: Permission[] = [];
    for (const permData of permissions) {
      const existingPerm = await this.permissionsRepository.findOne({ where: { name: permData.name } });
      if (!existingPerm) {
        const perm = this.permissionsRepository.create(permData);
        const savedPerm = await this.permissionsRepository.save(perm);
        createdPermissions.push(savedPerm);
      } else {
        createdPermissions.push(existingPerm);
      }
    }

    // 初始化角色
    const roles = [
      { name: '系统管理员', description: '拥有所有权限', permissionIds: createdPermissions.map(p => p.id) },
      { name: 'HR管理员', description: '人力资源管理权限', permissionIds: createdPermissions.filter(p => p.name.includes('user') || p.name.includes('position')).map(p => p.id) },
      { name: '部门管理者', description: '部门管理权限', permissionIds: createdPermissions.filter(p => p.name.includes('user') || p.name.includes('position')).map(p => p.id) },
      { name: '工程师', description: '普通工程师权限', permissionIds: createdPermissions.filter(p => p.name === 'position:read').map(p => p.id) },
    ];

    let adminRoleId;
    for (const roleData of roles) {
      const existingRole = await this.rolesRepository.findOne({ where: { name: roleData.name } });
      if (!existingRole) {
        const role = this.rolesRepository.create({
          name: roleData.name,
          description: roleData.description,
          permissions: createdPermissions.filter(p => roleData.permissionIds.includes(p.id)),
        });
        const savedRole = await this.rolesRepository.save(role);
        if (roleData.name === '系统管理员') {
          adminRoleId = savedRole.id;
        }
      } else {
        if (existingRole.name === '系统管理员') {
          adminRoleId = existingRole.id;
        }
      }
    }

    // 初始化系统管理员账号
    const adminUser = await this.usersRepository.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin', 10); // 密码默认为用户名
      const user = this.usersRepository.create({
        username: 'admin',
        password: hashedPassword,
        name: '系统管理员',
        email: 'admin@example.com',
        roleId: adminRoleId,
        permissions: createdPermissions.map(p => p.name),
        isActive: true,
      });
      await this.usersRepository.save(user);
    }
  }
}
