import { Injectable, type MessageEvent } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { filter, interval, map, merge, Observable, Subject } from 'rxjs';
import {
  appEventSchema,
  type AppEvent,
  type AppEventName,
  type AppEventPayloads,
  type EventFor,
} from '@arcivo/api-contracts';

@Injectable()
export class EventService {
  private readonly events = new Subject<{
    ownerId: string;
    event: AppEvent;
  }>();

  publish<TName extends AppEventName>(
    ownerId: string,
    type: TName,
    data: AppEventPayloads[TName],
  ): EventFor<TName> {
    const event = appEventSchema.parse({
      id: randomUUID(),
      type,
      occurredAt: new Date().toISOString(),
      data,
    }) as EventFor<TName>;

    this.events.next({ ownerId, event });
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
