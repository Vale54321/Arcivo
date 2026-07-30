import { Injectable, type MessageEvent } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { interval, map, merge, Observable, Subject } from 'rxjs';
import {
  type AnyAppEvent,
  type AppEvent,
  type AppEventName,
  type AppEventPayloads,
} from './event.types';

@Injectable()
export class EventService {
  private readonly events = new Subject<AnyAppEvent>();

  publish<TName extends AppEventName>(
    type: TName,
    data: AppEventPayloads[TName],
  ): AppEvent<TName> {
    const event: AppEvent<TName> = {
      id: randomUUID(),
      type,
      occurredAt: new Date().toISOString(),
      data,
    };

    this.events.next(event as AnyAppEvent);
    return event;
  }

  stream(): Observable<MessageEvent> {
    const applicationEvents = this.events.pipe(
      map((event) => ({
        id: event.id,
        data: event,
      })),
    );
    const heartbeats = interval(25_000).pipe(
      map(() => ({
        type: 'heartbeat',
        data: { occurredAt: new Date().toISOString() },
      })),
    );

    return merge(applicationEvents, heartbeats);
  }
}
