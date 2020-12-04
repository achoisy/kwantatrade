// Publish new chart tick after new tick added to database
import { Publisher, Subjects, StreamStatusEvent } from '@quantatrading/common';

export class StreamerStatusPublisher extends Publisher<StreamStatusEvent> {
  readonly subject = Subjects.StreamStatus;
}
