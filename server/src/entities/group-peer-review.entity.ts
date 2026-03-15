import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Group } from './group.entity';
import { User } from './user.entity';

@Entity('group_peer_reviews')
@Index(
  'idx_group_reviewer_target_unique',
  ['groupId', 'reviewerId', 'targetUserId'],
  {
    unique: true,
  },
)
export class GroupPeerReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'group_id' })
  groupId: number;

  @Column({ name: 'reviewer_id' })
  reviewerId: number;

  @Column({ name: 'target_user_id' })
  targetUserId: number;

  @Column({ type: 'json' })
  scores: Record<string, number>;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'target_user_id' })
  targetUser: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
