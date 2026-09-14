import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiExtraModels, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SourceType } from '../common/enums';
import { MockEdrPayloadDto } from './dto/mock-edr.dto';
import { MockIamPayloadDto } from './dto/mock-iam.dto';
import { MockSiemPayloadDto } from './dto/mock-siem.dto';
import { AdapterRegistry } from './adapters/adapter-registry';
import { IngestKeyGuard } from './ingest-key.guard';
import { IngestionService } from './ingestion.service';

@ApiTags('ingestion')
@ApiExtraModels(MockSiemPayloadDto, MockEdrPayloadDto, MockIamPayloadDto)
@ApiSecurity('ingest-key')
@Controller('ingest')
@UseGuards(IngestKeyGuard)
export class IngestionController {
  constructor(
    private readonly registry: AdapterRegistry,
    private readonly ingestion: IngestionService
  ) {}

  @Post(':sourceType')
  @ApiOperation({ summary: 'Validate and ingest one fictional source event' })
  @ApiParam({ name: 'sourceType', enum: SourceType })
  @ApiBody({ schema: { oneOf: [{ $ref: '#/components/schemas/MockSiemPayloadDto' }, { $ref: '#/components/schemas/MockEdrPayloadDto' }, { $ref: '#/components/schemas/MockIamPayloadDto' }] } })
  ingest(@Param('sourceType') sourceType: SourceType, @Body() body: MockSiemPayloadDto | MockEdrPayloadDto | MockIamPayloadDto) {
    const adapter = this.registry.get(sourceType);
    const payload = adapter.validate(body);
    return this.ingestion.ingest(adapter.normalize(payload));
  }
}

