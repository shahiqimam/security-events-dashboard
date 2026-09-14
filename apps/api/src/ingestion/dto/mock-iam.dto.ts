import { IsDateString, IsEmail, IsInt, IsIP, IsString, Max, Min } from 'class-validator';

export class MockIamPayloadDto {
  @IsString()
  id!: string;

  @IsInt()
  @Min(0)
  @Max(100)
  risk!: number;

  @IsEmail()
  actor!: string;

  @IsString()
  activity!: string;

  @IsIP()
  ipAddress!: string;

  @IsDateString()
  created!: string;
}
