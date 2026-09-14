import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsObject, IsString, ValidateNested } from 'class-validator';

class MockEdrDeviceDto {
  @ApiProperty({ example: 'LAPTOP-22' })
  @IsString()
  hostname!: string;

  @ApiProperty({ example: 'Windows' })
  @IsString()
  platform!: string;
}

export class MockEdrPayloadDto {
  @ApiProperty({ example: 'edr-2001' })
  @IsString()
  detectionId!: string;

  @ApiProperty({ enum: ['info', 'low', 'medium', 'high', 'critical'], example: 'high' })
  @IsIn(['info', 'low', 'medium', 'high', 'critical'])
  severity!: string;

  @ApiProperty({ type: MockEdrDeviceDto })
  @IsObject()
  @ValidateNested()
  @Type(() => MockEdrDeviceDto)
  device!: MockEdrDeviceDto;

  @ApiProperty({ example: 'Suspicious PowerShell' })
  @IsString()
  detectionType!: string;

  @ApiProperty({ example: '2026-09-12T10:05:00Z' })
  @IsDateString()
  timestamp!: string;
}
