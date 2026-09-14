import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsIP, IsString, Max, Min } from 'class-validator';

export class MockSiemPayloadDto {
  @ApiProperty({ example: 'siem-1001' })
  @IsString()
  event_id!: string;

  @ApiProperty({ minimum: 0, maximum: 15, example: 12 })
  @IsInt()
  @Min(0)
  @Max(15)
  rule_level!: number;

  @ApiProperty({ example: 'Repeated login failures' })
  @IsString()
  rule_name!: string;

  @ApiProperty({ example: 'WS-014' })
  @IsString()
  agent_name!: string;

  @ApiProperty({ example: '198.51.100.25' })
  @IsIP()
  src_ip!: string;

  @ApiProperty({ example: '2026-09-12T10:00:00Z' })
  @IsDateString()
  occurred_at!: string;
}
