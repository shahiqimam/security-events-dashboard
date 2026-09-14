import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from 'typeorm';
import { Category, EventStatus, Severity, SourceType } from '../../common/enums';
import { User } from './user.entity';

@Entity('security_events')
@Unique(['sourceType', 'sourceEventId'])
export class SecurityEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'enum', enum: SourceType, enumName: 'source_type_enum' })
  sourceType!: SourceType;

  @Column()
  sourceEventId!: string;

  @Column()
  title!: string;

  @Column({ type: 'varchar', nullable: true })
  description!: string | null;

  @Index()
  @Column({ type: 'enum', enum: Severity, enumName: 'severity_enum' })
  severity!: Severity;

  @Index()
  @Column({ type: 'enum', enum: Category, enumName: 'category_enum' })
  category!: Category;

  @Index()
  @Column({ type: 'enum', enum: EventStatus, enumName: 'event_status_enum', default: EventStatus.OPEN })
  status!: EventStatus;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  assetName!: string | null;

  @Column({ type: 'varchar', nullable: true })
  username!: string | null;

  @Column({ type: 'varchar', nullable: true })
  sourceIp!: string | null;

  @Index()
  @Column({ type: 'timestamptz' })
  detectedAt!: Date;

  @Column({ type: 'timestamptz' })
  firstSeenAt!: Date;

  @Column({ type: 'timestamptz' })
  lastSeenAt!: Date;

  @Column({ default: 1 })
  occurrenceCount!: number;

  @Column()
  fingerprint!: string;

  @Column({ type: 'jsonb' })
  rawPayload!: Record<string, unknown>;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  assignedToId!: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo?: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}



