import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { EventStatus } from '../../common/enums';

export class UpdateStatusDto {
  @IsEnum(EventStatus)
  status!: EventStatus;
}

export class AssignmentDto {
  @IsOptional()
  @IsUUID()
  assignedToId?: string | null;
}

export class NoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}
