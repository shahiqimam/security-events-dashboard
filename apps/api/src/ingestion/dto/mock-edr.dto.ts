import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsObject, IsString, ValidateNested } from 'class-validator';

class MockEdrDeviceDto {
  @IsString()
  hostname!: string;

  @IsString()
  platform!: string;
}

export class MockEdrPayloadDto {
  @IsString()
  detectionId!: string;

  @IsIn(['info', 'low', 'medium', 'high', 'critical'])
  severity!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => MockEdrDeviceDto)
  device!: MockEdrDeviceDto;

  @IsString()
  detectionType!: string;

  @IsDateString()
  timestamp!: string;
}
