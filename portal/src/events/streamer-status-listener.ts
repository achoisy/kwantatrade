import { Message } from 'node-nats-streaming';
import { Listener, Subjects, StreamStatusEvent } from '@quantatrading/common';
import { socketio } from '../services/socketio-server';

export class StreamStatusListener extends Listener<StreamStatusEvent> {
  readonly subject = Subjects.StreamStatus;
  queueGroupName = '';
  durableName = '';

  onMessage(data: StreamStatusEvent['data'], msg: Message) {
    //On new message relay it thru socketio
    socketio.pubStatus(data);
    msg.ack();
  }
}
