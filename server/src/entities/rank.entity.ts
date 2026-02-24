import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ranks')
export class Rank {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: 'F' | 'E';

  @Column()
  level: string;

  @Column()
  name: string;

  @Column()
  years: string;

  @Column()
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
