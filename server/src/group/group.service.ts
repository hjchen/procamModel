import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { Position } from '../entities/position.entity';
import { GroupPeerReview } from '../entities/group-peer-review.entity';

type PeerReviewDimension = {
  code: string;
  title: string;
  description: string;
  standardScore: number;
};

type PeerReviewTarget = {
  id: number;
  username: string;
  name: string;
  email: string;
  positionId: number | null;
  rank: string | null;
  abilityDimensions: PeerReviewDimension[];
  myReviewScores: Record<string, number>;
  myReviewUpdatedAt: string | null;
};

type PeerReviewGroup = {
  id: number;
  name: string;
  departmentId: number;
  targets: PeerReviewTarget[];
};

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    @InjectRepository(Position)
    private positionsRepository: Repository<Position>,
    @InjectRepository(GroupPeerReview)
    private groupPeerReviewRepository: Repository<GroupPeerReview>,
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
      where: { id: groupData.departmentId },
    });
    if (!department) {
      throw new BadRequestException('部门不存在');
    }

    // 检查同一部门下分组名称是否重复
    const existingGroup = await this.groupsRepository.findOne({
      where: {
        name: groupData.name,
        departmentId: groupData.departmentId,
      },
    });
    if (existingGroup) {
      throw new BadRequestException('该部门下已存在同名分组');
    }

    const group = this.groupsRepository.create(groupData);
    return this.groupsRepository.save(group);
  }

  async update(
    id: number,
    groupData: {
      name?: string;
      description?: string;
    },
  ): Promise<Group> {
    const group = await this.findOne(id);

    if (groupData.name) {
      // 检查同一部门下分组名称是否重复
      const existingGroup = await this.groupsRepository.findOne({
        where: {
          name: groupData.name,
          departmentId: group.departmentId,
        },
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
      where: memberIds.map((id) => ({ id })),
    });

    if (users.length !== memberIds.length) {
      throw new BadRequestException('部分用户不存在');
    }

    // 检查用户是否属于同一部门
    const departmentUsers = users.filter(
      (user) => user.departmentId === group.departmentId,
    );
    if (departmentUsers.length !== users.length) {
      throw new BadRequestException('只能添加同一部门的成员');
    }

    // 获取当前成员ID列表
    const currentMemberIds = group.members.map((m) => m.id);

    // 过滤掉已经在分组中的成员
    const newMemberIds = memberIds.filter(
      (id) => !currentMemberIds.includes(id),
    );

    if (newMemberIds.length === 0) {
      return group;
    }

    const newMembers = users.filter((user) => newMemberIds.includes(user.id));
    group.members = [...group.members, ...newMembers];

    return this.groupsRepository.save(group);
  }

  async removeMembers(groupId: number, memberIds: number[]): Promise<Group> {
    const group = await this.findOne(groupId);

    if (memberIds.length === 0) {
      return group;
    }

    // 过滤掉要移除的成员
    group.members = group.members.filter(
      (member) => !memberIds.includes(member.id),
    );

    return this.groupsRepository.save(group);
  }

  async updateMembers(groupId: number, memberIds: number[]): Promise<Group> {
    const group = await this.findOne(groupId);

    if (memberIds.length === 0) {
      group.members = [];
    } else {
      // 验证用户是否存在且属于同一部门
      const users = await this.usersRepository.find({
        where: memberIds.map((id) => ({ id })),
      });

      if (users.length !== memberIds.length) {
        throw new BadRequestException('部分用户不存在');
      }

      // 检查用户是否属于同一部门
      const departmentUsers = users.filter(
        (user) => user.departmentId === group.departmentId,
      );
      if (departmentUsers.length !== users.length) {
        throw new BadRequestException('只能添加同一部门的成员');
      }

      group.members = users;
    }

    return this.groupsRepository.save(group);
  }

  async getMyPeerReviewTargets(userId: number): Promise<PeerReviewGroup[]> {
    const groups = await this.groupsRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.members', 'member')
      .leftJoin('group.members', 'reviewer')
      .where('reviewer.id = :userId', { userId })
      .getMany();

    if (groups.length === 0) {
      return [];
    }

    const positionIds = Array.from(
      new Set(
        groups
          .flatMap((group) => group.members || [])
          .map((member) => member.positionId)
          .filter((positionId): positionId is number => !!positionId),
      ),
    );

    const positions =
      positionIds.length > 0
        ? await this.positionsRepository.find({
            where: positionIds.map((id) => ({ id })),
            relations: ['abilityDimensions'],
          })
        : [];

    const positionMap = new Map<number, Position>();
    positions.forEach((position) => {
      positionMap.set(position.id, position);
    });

    const groupIds = groups.map((group) => group.id);
    const myReviews = await this.groupPeerReviewRepository
      .createQueryBuilder('review')
      .where('review.reviewerId = :userId', { userId })
      .andWhere('review.groupId IN (:...groupIds)', { groupIds })
      .getMany();

    const reviewMap = new Map<string, GroupPeerReview>();
    myReviews.forEach((review) => {
      reviewMap.set(`${review.groupId}-${review.targetUserId}`, review);
    });

    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      departmentId: group.departmentId,
      targets: (group.members || [])
        .filter((member) => member.id !== userId)
        .map((member) => {
          const position = member.positionId
            ? positionMap.get(member.positionId)
            : undefined;
          const abilityDimensions = (position?.abilityDimensions || []).map(
            (dimension) => ({
              code: dimension.code,
              title: dimension.title,
              description: dimension.description,
              standardScore: dimension.scores?.[member.rank || ''] || 0,
            }),
          );
          const reviewKey = `${group.id}-${member.id}`;
          const review = reviewMap.get(reviewKey);
          return {
            id: member.id,
            username: member.username,
            name: member.name,
            email: member.email,
            positionId: member.positionId || null,
            rank: member.rank || null,
            abilityDimensions,
            myReviewScores: review?.scores || {},
            myReviewUpdatedAt: review?.updatedAt
              ? new Date(review.updatedAt).toISOString()
              : null,
          };
        }),
    }));
  }

  async savePeerReviewScore(
    userId: number,
    data: {
      groupId: number;
      targetUserId: number;
      scores: Record<string, number>;
    },
  ): Promise<GroupPeerReview> {
    const group = await this.groupsRepository.findOne({
      where: { id: data.groupId },
      relations: ['members'],
    });

    if (!group) {
      throw new NotFoundException('分组不存在');
    }

    if (data.targetUserId === userId) {
      throw new BadRequestException('不能给自己评分');
    }

    const reviewerInGroup = group.members.some(
      (member) => member.id === userId,
    );
    if (!reviewerInGroup) {
      throw new BadRequestException('当前用户不在该分组中');
    }

    const targetInGroup = group.members.some(
      (member) => member.id === data.targetUserId,
    );
    if (!targetInGroup) {
      throw new BadRequestException('被评分成员不在该分组中');
    }

    const normalizedScores = Object.entries(data.scores || {}).reduce(
      (result, [key, value]) => {
        const numberValue = Number(value);
        if (!Number.isNaN(numberValue)) {
          result[key] = Math.max(0, Math.min(100, numberValue));
        }
        return result;
      },
      {} as Record<string, number>,
    );

    let review = await this.groupPeerReviewRepository.findOne({
      where: {
        groupId: data.groupId,
        reviewerId: userId,
        targetUserId: data.targetUserId,
      },
    });

    if (!review) {
      review = this.groupPeerReviewRepository.create({
        groupId: data.groupId,
        reviewerId: userId,
        targetUserId: data.targetUserId,
        scores: normalizedScores,
      });
    } else {
      review.scores = normalizedScores;
    }

    return this.groupPeerReviewRepository.save(review);
  }

  async delete(id: number): Promise<void> {
    const group = await this.findOne(id);
    await this.groupsRepository.remove(group);
  }
}
