import { Publisher, IgCredentialEvent, Subjects } from '@quantatrading/common';

export class IgCredentialPublisher extends Publisher<IgCredentialEvent> {
  readonly subject = Subjects.IgCredential;
}
