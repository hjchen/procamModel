import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { GroupPeerReview } from '../entities/group-peer-review.entity';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    @InjectRepository(GroupPeerReview)
    private groupPeerReviewRepository: Repository<GroupPeerReview>,
  ) {}

  private async buildDepartmentMembers(departmentId: number): Promise<
    Array<
      User & {
        groupPeerAverageScore: number | null;
        groupPeerAverageScores: Record<string, number>;
        groupPeerReviewCount: number;
      }
    >
  > {
    const [departmentMembers, groups] = await Promise.all([
      this.usersRepository.find({
        where: { departmentId },
        relations: ['role'],
      }),
      this.groupsRepository.find({
        where: { departmentId },
        relations: ['members', 'members.role'],
      }),
    ]);

    const memberMap = new Map<number, User>();
    [
      ...departmentMembers,
      ...groups.flatMap((group) => group.members || []),
    ].forEach((member) => {
      if (!memberMap.has(member.id)) {
        memberMap.set(member.id, member);
      }
    });

    const targetUserIds = Array.from(memberMap.keys());
    const groupIds = groups.map((group) => group.id);
    const reviewStatMap = new Map<
      number,
      {
        total: number;
        totalCount: number;
        reviewCount: number;
        dimensionSums: Record<string, number>;
        dimensionCounts: Record<string, number>;
      }
    >();

    if (targetUserIds.length > 0 && groupIds.length > 0) {
      const reviews = await this.groupPeerReviewRepository.find({
        where: {
          groupId: In(groupIds),
          targetUserId: In(targetUserIds),
        },
        order: {
          updatedAt: 'DESC',
          id: 'DESC',
        },
      });

      const latestReviews = new Map<string, GroupPeerReview>();
      reviews.forEach((review) => {
        const reviewKey = `${review.targetUserId}-${review.reviewerId}`;
        if (!latestReviews.has(reviewKey)) {
          latestReviews.set(reviewKey, review);
        }
      });

      latestReviews.forEach((review) => {
        const current = reviewStatMap.get(review.targetUserId) || {
          total: 0,
          totalCount: 0,
          reviewCount: 0,
          dimensionSums: {},
          dimensionCounts: {},
        };

        Object.entries(review.scores || {}).forEach(
          ([dimensionCode, value]) => {
            const score = Number(value);
            if (!Number.isFinite(score)) {
              return;
            }
            current.total += score;
            current.totalCount += 1;
            current.dimensionSums[dimensionCode] =
              (current.dimensionSums[dimensionCode] || 0) + score;
            current.dimensionCounts[dimensionCode] =
              (current.dimensionCounts[dimensionCode] || 0) + 1;
          },
        );

        current.reviewCount += 1;
        reviewStatMap.set(review.targetUserId, current);
      });
    }

    return Array.from(memberMap.values()).map((member) => {
      const stat = reviewStatMap.get(member.id);
      if (!stat || stat.totalCount === 0) {
        return {
          ...member,
          groupPeerAverageScore: null,
          groupPeerAverageScores: {},
          groupPeerReviewCount: 0,
        };
      }

      const groupPeerAverageScores = Object.keys(stat.dimensionSums).reduce(
        (result, dimensionCode) => {
          const count = stat.dimensionCounts[dimensionCode];
          result[dimensionCode] = Number(
            (stat.dimensionSums[dimensionCode] / count).toFixed(1),
          );
          return result;
        },
        {} as Record<string, number>,
      );

      return {
        ...member,
        groupPeerAverageScore: Number(
          (stat.total / stat.totalCount).toFixed(1),
        ),
        groupPeerAverageScores,
        groupPeerReviewCount: stat.reviewCount,
      };
    });
  }

  async findAll(): Promise<Department[]> {
    const departments = await this.departmentsRepository.find();
    const departmentsWithMembers = await Promise.all(
      departments.map(async (department) => ({
        ...department,
        members: await this.buildDepartmentMembers(department.id),
      })),
    );
    return departmentsWithMembers as Department[];
  }

  async findOne(id: number): Promise<any> {
    const department = await this.departmentsRepository.findOne({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException('部门不存在');
    }
    const members = await this.buildDepartmentMembers(id);
    return { ...department, members };
  }

  async getMembers(id: number): Promise<User[]> {
    const department = await this.findOne(id);
    return department.members || [];
  }

  async create(departmentData: {
    name: string;
    description?: string;
    managerId?: number;
  }): Promise<Department> {
    const department = this.departmentsRepository.create(departmentData);
    return this.departmentsRepository.save(department);
  }

  async update(
    id: number,
    departmentData: {
      name?: string;
      description?: string;
      managerId?: number;
    },
  ): Promise<Department> {
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
      { departmentId: null },
    );

    // 设置新成员的部门关联
    if (memberIds.length > 0) {
      await this.usersRepository.update(memberIds, { departmentId: id });
    }

    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const department = await this.findOne(id);

    // 清除成员的部门关联
    await this.usersRepository.update(
      { departmentId: id },
      { departmentId: null },
    );

    await this.departmentsRepository.remove(department);
  }
}
