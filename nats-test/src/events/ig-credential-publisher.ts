import { Publisher } from './publisher';
import { IgCredentialEvent } from './ig-credential-event';
import { Subjects } from './subjects';

export class IgCredentialPublisher extends Publisher<IgCredentialEvent> {
  readonly subject = Subjects.IgCredential;
}
