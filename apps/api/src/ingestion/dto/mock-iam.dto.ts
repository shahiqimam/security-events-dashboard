import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsInt, IsIP, IsString, Max, Min } from 'class-validator';

export class MockIamPayloadDto {
  @ApiProperty({ example: 'iam-3001' })
  @IsString()
  id!: string;

  @ApiProperty({ minimum: 0, maximum: 100, example: 90 })
  @IsInt()
  @Min(0)
  @Max(100)
  risk!: number;

  @ApiProperty({ example: 'demo.user@example.com' })
  @IsEmail()
  actor!: string;

  @ApiProperty({ example: 'Multiple MFA failures' })
  @IsString()
  activity!: string;

  @ApiProperty({ example: '203.0.113.15' })
  @IsIP()
  ipAddress!: string;

  @ApiProperty({ example: '2026-09-12T10:10:00Z' })
  @IsDateString()
  created!: string;
}
