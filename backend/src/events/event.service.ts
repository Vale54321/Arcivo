import { Injectable, type MessageEvent } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { filter, interval, map, merge, Observable, Subject } from 'rxjs';
import {
  type AnyAppEvent,
  type AppEvent,
  type AppEventName,
  type AppEventPayloads,
} from './event.types';

@Injectable()
export class EventService {
  private readonly events = new Subject<{
    ownerId: string;
    event: AnyAppEvent;
  }>();

  publish<TName extends AppEventName>(
    ownerId: string,
    type: TName,
    data: AppEventPayloads[TName],
  ): AppEvent<TName> {
    const event: AppEvent<TName> = {
      id: randomUUID(),
      type,
      occurredAt: new Date().toISOString(),
      data,
    };

    this.events.next({ ownerId, event: event as AnyAppEvent });
    return event;
  }

  stream(ownerId: string): Observable<MessageEvent> {
    const applicationEvents = this.events.pipe(
      filter((event) => event.ownerId === ownerId),
      map(({ event }) => ({
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
