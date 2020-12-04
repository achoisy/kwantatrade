// Publish new chart tick after new tick added to database
import { Publisher, Subjects, ChartTickEvent } from '@quantatrading/common';

export class ChartTickPublisher extends Publisher<ChartTickEvent> {
  readonly subject = Subjects.ChartTick;
}
