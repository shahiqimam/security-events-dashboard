import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SourceType } from '../../common/enums';

@Entity('event_sources')
export class EventSource {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: SourceType, enumName: 'source_type_enum', unique: true })
  sourceType!: SourceType;

  @Column({ default: true })
  enabled!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastEventAt!: Date | null;

  @Column({ default: 0 })
  totalEvents!: number;

  @Column({ nullable: true })
  lastError!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

