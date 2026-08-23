import { EventService } from '../event.service';
import { APP_EVENTS } from '@arcivo/api-contracts';

describe(EventService.name, () => {
  it('only sends events to the document owner', () => {
    const service = new EventService();
    const ownerEvents: unknown[] = [];
    const otherUserEvents: unknown[] = [];
    const ownerSubscription = service
      .stream('owner-id')
      .subscribe((event) => ownerEvents.push(event.data));
    const otherUserSubscription = service
      .stream('other-user-id')
      .subscribe((event) => otherUserEvents.push(event.data));

    service.publish('owner-id', APP_EVENTS.DOCUMENT_THUMBNAIL_GENERATED, {
      documentId: '11111111-1111-4111-8111-111111111111',
    });
    service.publish('third-user-id', APP_EVENTS.DOCUMENT_THUMBNAIL_GENERATED, {
      documentId: '22222222-2222-4222-8222-222222222222',
    });

    expect(ownerEvents).toEqual([
      expect.objectContaining({
        type: APP_EVENTS.DOCUMENT_THUMBNAIL_GENERATED,
        data: { documentId: '11111111-1111-4111-8111-111111111111' },
      }),
    ]);
    expect(otherUserEvents).toEqual([]);

    ownerSubscription.unsubscribe();
    otherUserSubscription.unsubscribe();
  });
});
