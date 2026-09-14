import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SecurityEvent } from './security-event.entity';
import { User } from './user.entity';

@Entity('event_notes')
export class EventNote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  eventId!: string;

  @ManyToOne(() => SecurityEvent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event!: SecurityEvent;

  @Column()
  authorId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author!: User;

  @Column({ type: 'text' })
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
