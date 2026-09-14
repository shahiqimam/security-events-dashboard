import { IsDateString, IsInt, IsIP, IsString, Max, Min } from 'class-validator';

export class MockSiemPayloadDto {
  @IsString()
  event_id!: string;

  @IsInt()
  @Min(0)
  @Max(15)
  rule_level!: number;

  @IsString()
  rule_name!: string;

  @IsString()
  agent_name!: string;

  @IsIP()
  src_ip!: string;

  @IsDateString()
  occurred_at!: string;
}
