import { Message } from 'node-nats-streaming';
import { Listener } from './listener';
import { ChartTickEvent } from './chart-tick-event';
import { Subjects } from './subjects';

export class ChartTickListener extends Listener<ChartTickEvent> {
  readonly subject = Subjects.ChartTick;
  queueGroupName = '';
  durableName = '';

  onMessage(data: ChartTickEvent['data'], msg: Message) {
    // Business logic goes here !
    console.log('event data!', data);

    // On success
    msg.ack();
  }
}
