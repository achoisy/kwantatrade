// IGAuth is in charge of passing thru Ig crediential to other microservices
// It emit a new Token on startup and every 6H after that
import { IgCredential } from './services/ig-credential';
import { natsWrapper } from '@quantatrading/common';
import './env-check';

const start = async () => {
  console.log('Starting up IgCredential...');
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID!,
      process.env.NATS_CLIENT_ID!,
      process.env.NATS_URL!
    );

    // Setup gracefull closing of NATS connection
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed !');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new IgCredential(natsWrapper.client).publish().catch((error) => {});

    // Set 6H interval between credential sending
    setInterval(() => {
      new IgCredential(natsWrapper.client).publish().catch((error) => {});
    }, 21600000); // 6h: 21600000
  } catch (error) {
    console.error(error);
  }
};

start();
