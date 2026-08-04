import { EventService } from '../event.service';
import { APP_EVENTS } from '../event.types';

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
      documentId: 'owner-document-id',
    });
    service.publish('third-user-id', APP_EVENTS.DOCUMENT_THUMBNAIL_GENERATED, {
      documentId: 'third-user-document-id',
    });

    expect(ownerEvents).toEqual([
      expect.objectContaining({
        type: APP_EVENTS.DOCUMENT_THUMBNAIL_GENERATED,
        data: { documentId: 'owner-document-id' },
      }),
    ]);
    expect(otherUserEvents).toEqual([]);

    ownerSubscription.unsubscribe();
    otherUserSubscription.unsubscribe();
  });
});
