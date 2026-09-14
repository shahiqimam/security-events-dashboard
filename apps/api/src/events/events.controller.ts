import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../common/enums';
import { AssignmentDto, NoteDto, UpdateStatusDto } from './dto/mutations.dto';
import { EventQueryDto } from './dto/event-query.dto';
import { EventsService } from './events.service';

type RequestUser = { user: { id: string; role: UserRole } };

@ApiTags('events')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get('events')
  @ApiOperation({ summary: 'List security events with filters and pagination' })
  list(@Query() query: EventQueryDto) {
    return this.events.list(query);
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Get a security event detail record' })
  get(@Param('id') id: string) {
    return this.events.get(id);
  }

  @Patch('events/:id/status')
  @ApiOperation({ summary: 'Update event status using the allowed workflow transitions' })
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  status(@Param('id') id: string, @Body() dto: UpdateStatusDto, @Req() req: RequestUser) {
    return this.events.updateStatus(id, dto.status, req.user.id);
  }

  @Patch('events/:id/assignment')
  @ApiOperation({ summary: 'Assign or unassign an event' })
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  assignment(@Param('id') id: string, @Body() dto: AssignmentDto, @Req() req: RequestUser) {
    return this.events.assign(id, dto.assignedToId ?? null, req.user.id);
  }

  @Get('events/:id/history')
  @ApiOperation({ summary: 'List event history records' })
  history(@Param('id') id: string) {
    return this.events.history(id);
  }

  @Post('events/:id/notes')
  @ApiOperation({ summary: 'Add an analyst note' })
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  addNote(@Param('id') id: string, @Body() dto: NoteDto, @Req() req: RequestUser) {
    return this.events.addNote(id, dto.content, req.user.id);
  }

  @Get('events/:id/notes')
  notes(@Param('id') id: string) {
    return this.events.notes(id);
  }

  @Patch('notes/:id')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  updateNote(@Param('id') id: string, @Body() dto: NoteDto, @Req() req: RequestUser) {
    return this.events.updateNote(id, dto.content, req.user.id);
  }

  @Delete('notes/:id')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  deleteNote(@Param('id') id: string) {
    return this.events.deleteNote(id);
  }
}



