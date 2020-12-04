import { Message } from 'node-nats-streaming';
import { Listener, Subjects, ChartTickEvent } from '@quantatrading/common';
import { socketio } from '../services/socketio-server';

export class ChartTickListener extends Listener<ChartTickEvent> {
  readonly subject = Subjects.ChartTick;
  queueGroupName = '';
  durableName = '';

  onMessage(data: ChartTickEvent['data'], msg: Message) {
    //On new message relay it thru socketio
    // console.log('new event: ', data);
    socketio.pubChartTick(data);
    msg.ack();
  }
}
