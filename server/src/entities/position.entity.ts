import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AbilityDimension } from './ability-dimension.entity';

@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column()
  dimensions: number;

  @Column()
  ranks: string;

  @Column()
  status: 'active' | 'inactive';

  @OneToMany(() => AbilityDimension, dimension => dimension.position)
  abilityDimensions: AbilityDimension[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
