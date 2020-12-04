import { Subjects } from './subjects';

export interface IgCredentialEvent {
  subject: Subjects.IgCredential;
  data: {
    lightStreamPassword: string;
    activeAccountId: string;
    lightstreamerEndpoint: string;
  };
}
