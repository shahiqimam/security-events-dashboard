import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { EventStatus } from '../../common/enums';

export class UpdateStatusDto {
  @ApiProperty({ enum: EventStatus, example: EventStatus.INVESTIGATING })
  @IsEnum(EventStatus)
  status!: EventStatus;
}

export class AssignmentDto {
  @ApiPropertyOptional({ description: 'ADMIN or ANALYST user ID. Null or omitted clears assignment.' })
  @IsOptional()
  @IsUUID()
  assignedToId?: string | null;
}

export class NoteDto {
  @ApiProperty({ minLength: 1, maxLength: 2000, example: 'Reviewed login pattern and contacted endpoint owner.' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}
