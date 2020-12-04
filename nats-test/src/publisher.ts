import nats from 'node-nats-streaming';
import { IgCredentialPublisher } from './events/ig-credential-publisher';
console.clear();
const stan = nats.connect('trading', 'abc', {
  url: 'http://localhost:4222',
});

stan.on('connect', async () => {
  console.log('Pulisher connected');

  const publisher = new IgCredentialPublisher(stan);
  try {
    await publisher.publish({
      lightStreamPassword: 'CST-570dea524842d85aa59219',
      activeAccountId: 'Z3JL9E',
      lightstreamerEndpoint: 'https://demo-apd.marketdatasystems.com',
    });
  } catch (error) {
    console.error(error);
  }
});
