import { Message, Stan } from 'node-nats-streaming';
import { Listener, IgCredentialEvent, Subjects } from '@quantatrading/common';

export class IgCredentialListener extends Listener<IgCredentialEvent> {
  readonly subject = Subjects.IgCredential;
  queueGroupName = '';
  durableName = '';
  private _igCredential?: IgCredentialEvent['data'];

  constructor(private stan: Stan) {
    super(stan);
  }

  get igCredential() {
    if (!this._igCredential) {
      throw new Error('Ig credential not defined');
    }
    return this._igCredential;
  }
  onMessage(data: IgCredentialEvent['data'], msg: Message) {
    this._igCredential = data;
    msg.ack();
  }

  getCredential(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const subscription = this.stan.subscribe(
          this.subject,
          this.subscriptionOptions()
        );

        // Get IG credential and listen to updates
        subscription.on('message', (msg: Message) => {
          this._igCredential = this.parseMessage(msg);
          msg.ack();
          // subscription.unsubscribe();
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
