import { Message } from 'node-nats-streaming';
import { Listener } from './listener';
import { IgCredentialEvent } from './ig-credential-event';
import { Subjects } from './subjects';

export class IgCredentialListener extends Listener<IgCredentialEvent> {
  readonly subject = Subjects.IgCredential;
  queueGroupName = '';
  durableName = '';

  onMessage(data: IgCredentialEvent['data'], msg: Message) {
    // Business logic goes here !
    console.log('event data!', data);

    // On success
    msg.ack();
  }
}
