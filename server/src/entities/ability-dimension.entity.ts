import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Position } from './position.entity';

@Entity('ability_dimensions')
export class AbilityDimension {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column('json')
  scores: Record<string, number>;

  @Column({ name: 'position_id' })
  positionId: number;

  @ManyToOne(() => Position)
  @JoinColumn({ name: 'position_id' })
  position: Position;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
