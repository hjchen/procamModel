import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from '../entities/section.entity';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private sectionsRepository: Repository<Section>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  async findByDepartment(departmentId: number): Promise<Section[]> {
    return this.sectionsRepository.find({
      where: { departmentId },
      relations: ['members'],
    });
  }

  async findOne(id: number): Promise<Section> {
    const section = await this.sectionsRepository.findOne({
      where: { id },
      relations: ['members', 'department'],
    });
    if (!section) {
      throw new NotFoundException('科室不存在');
    }
    return section;
  }

  async create(sectionData: {
    name: string;
    description?: string;
    departmentId: number;
  }): Promise<Section> {
    const department = await this.departmentsRepository.findOne({
      where: { id: sectionData.departmentId },
    });
    if (!department) {
      throw new BadRequestException('部门不存在');
    }

    const existingSection = await this.sectionsRepository.findOne({
      where: {
        name: sectionData.name,
        departmentId: sectionData.departmentId,
      },
    });
    if (existingSection) {
      throw new BadRequestException('该部门下已存在同名科室');
    }

    const section = this.sectionsRepository.create(sectionData);
    return this.sectionsRepository.save(section);
  }

  async update(
    id: number,
    sectionData: {
      name?: string;
      description?: string;
    },
  ): Promise<Section> {
    const section = await this.findOne(id);

    if (sectionData.name) {
      const existingSection = await this.sectionsRepository.findOne({
        where: {
          name: sectionData.name,
          departmentId: section.departmentId,
        },
      });
      if (existingSection && existingSection.id !== id) {
        throw new BadRequestException('该部门下已存在同名科室');
      }
      section.name = sectionData.name;
    }

    if (sectionData.description !== undefined) {
      section.description = sectionData.description;
    }

    return this.sectionsRepository.save(section);
  }

  async addMembers(sectionId: number, memberIds: number[]): Promise<Section> {
    if (!Array.isArray(memberIds)) {
      throw new BadRequestException('memberIds 必须是数组');
    }

    const section = await this.findOne(sectionId);

    const normalizedMemberIds = Array.from(new Set(memberIds));
    if (normalizedMemberIds.length === 0) {
      return section;
    }

    const users = await this.usersRepository.find({
      where: normalizedMemberIds.map((id) => ({ id })),
    });

    if (users.length !== normalizedMemberIds.length) {
      throw new BadRequestException('部分用户不存在');
    }

    const departmentUsers = users.filter(
      (user) => user.departmentId === section.departmentId,
    );
    if (departmentUsers.length !== users.length) {
      throw new BadRequestException('只能添加同一部门的成员');
    }

    const currentMemberIds = section.members.map((m) => m.id);
    const newMemberIds = normalizedMemberIds.filter(
      (id) => !currentMemberIds.includes(id),
    );

    if (newMemberIds.length === 0) {
      return section;
    }

    await this.sectionsRepository
      .createQueryBuilder()
      .relation(Section, 'members')
      .of(sectionId)
      .add(newMemberIds);

    return this.findOne(sectionId);
  }

  async removeMembers(sectionId: number, memberIds: number[]): Promise<Section> {
    if (!Array.isArray(memberIds)) {
      throw new BadRequestException('memberIds 必须是数组');
    }

    const section = await this.findOne(sectionId);

    const normalizedMemberIds = Array.from(new Set(memberIds));
    if (normalizedMemberIds.length === 0) {
      return section;
    }

    const currentMemberIds = new Set(section.members.map((member) => member.id));
    const removableMemberIds = normalizedMemberIds.filter((id) =>
      currentMemberIds.has(id),
    );

    if (removableMemberIds.length === 0) {
      return section;
    }

    await this.sectionsRepository
      .createQueryBuilder()
      .relation(Section, 'members')
      .of(sectionId)
      .remove(removableMemberIds);

    return this.findOne(sectionId);
  }

  async updateMembers(sectionId: number, memberIds: number[]): Promise<Section> {
    if (!Array.isArray(memberIds)) {
      throw new BadRequestException('memberIds 必须是数组');
    }

    const section = await this.findOne(sectionId);
    const normalizedMemberIds = Array.from(new Set(memberIds));
    const currentMemberIds = section.members.map((member) => member.id);

    if (currentMemberIds.length > 0) {
      await this.sectionsRepository
        .createQueryBuilder()
        .relation(Section, 'members')
        .of(sectionId)
        .remove(currentMemberIds);
    }

    if (normalizedMemberIds.length === 0) {
      return this.findOne(sectionId);
    }

    const users = await this.usersRepository.find({
      where: normalizedMemberIds.map((id) => ({ id })),
    });

    if (users.length !== normalizedMemberIds.length) {
      throw new BadRequestException('部分用户不存在');
    }

    const departmentUsers = users.filter(
      (user) => user.departmentId === section.departmentId,
    );
    if (departmentUsers.length !== users.length) {
      throw new BadRequestException('只能添加同一部门的成员');
    }

    await this.sectionsRepository
      .createQueryBuilder()
      .relation(Section, 'members')
      .of(sectionId)
      .add(users.map((user) => user.id));

    return this.findOne(sectionId);
  }

  async delete(id: number): Promise<void> {
    const section = await this.findOne(id);
    await this.sectionsRepository.remove(section);
  }
}
