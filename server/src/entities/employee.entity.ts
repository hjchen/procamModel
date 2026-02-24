import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Position } from './position.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'position_id' })
  positionId: number;

  @ManyToOne(() => Position)
  @JoinColumn({ name: 'position_id' })
  position: Position;

  @Column()
  rank: string;

  @Column('json')
  scores: {
    tech: number;
    engineering: number;
    uiux: number;
    communication: number;
    problem: number;
  };

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
