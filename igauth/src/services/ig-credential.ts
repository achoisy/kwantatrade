import axios, { AxiosResponse } from 'axios';
import { Stan } from 'node-nats-streaming';
import { IgCredentialEvent } from '@quantatrading/common';
import { IgCredentialPublisher } from '../events/ig-credential-publisher';

export class IgCredential {
  private data?: IgCredentialEvent['data'];

  constructor(private client: Stan) {}

  publish(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        axios
          .post(
            process.env.IG_URL!,
            {
              identifier: process.env.IG_USERNAME,
              password: process.env.IG_PASSWORD,
              encryptedPassword: null,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'X-IG-API-KEY': process.env.IG_API_KEY,
              },
            }
          )
          .then((response: AxiosResponse) => {
            if (response.status != 200) {
              throw new Error(response.data.errorCode);
              //throw new Error('testing error handle');
            }

            const lightStreamPassword = `CST-${response.headers.cst}|XST-${response.headers['x-security-token']}`;
            const activeAccountId: string = response.data.currentAccountId;
            const lightstreamerEndpoint: string =
              response.data.lightstreamerEndpoint;

            this.data = {
              lightStreamPassword,
              activeAccountId,
              lightstreamerEndpoint,
            };

            new IgCredentialPublisher(this.client)
              .publish(this.data)
              .then(() => {
                resolve();
              });
          })
          .catch((error) => {
            console.error(`IgCredential ${error}`);
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }
}
