import {
  Controller,
  Header,
  type MessageEvent,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from 'auth/interfaces/authenticated-user.interface';
import type { Observable } from 'rxjs';
import { EventService } from './event.service';

@Controller('events')
@ApiTags('events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Sse()
  @Header('X-Accel-Buffering', 'no')
  @ApiExcludeEndpoint()
  stream(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Observable<MessageEvent> {
    return this.eventService.stream(currentUser.id);
  }
}
