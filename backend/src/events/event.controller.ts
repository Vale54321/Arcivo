import { Controller, Header, type MessageEvent, Sse } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import type { Observable } from 'rxjs';
import { EventService } from './event.service';

@Controller('events')
@ApiTags('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Sse()
  @Header('X-Accel-Buffering', 'no')
  @ApiExcludeEndpoint()
  stream(): Observable<MessageEvent> {
    return this.eventService.stream();
  }
}
