import { natsWrapper, mongoWrapper, Prometheus } from '@quantatrading/common';
import { LightStream } from './services/tick-streamer';

// Check for env before starting service
import './env-check';

// Set prometheus mettrics monitoring
const prometheus = new Prometheus({ serviceName: 'streamer' });

const start = async () => {
  console.log('Starting up Streamer service...');
  try {
    // Connect to NATS Streamming Server
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID!,
      process.env.NATS_CLIENT_ID!,
      process.env.NATS_URL!
    );

    // Setup gracefull closing of NATS connection
    // and lightStream connection
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed !');
    });

    // Connect to mongoDb cold and hot database
    await mongoWrapper.connect({
      hotMongoUri: process.env.HOT_MONGO_URI!,
      coldMongoUri: process.env.COLD_MONGO_URI!,
    });

    // Connect and subcribe to Chart epic tick
    // Send update tick to Nats server
    const lightStream = new LightStream(natsWrapper.client);
    await lightStream.connect();

    // Gracefull shutdown function
    const stop = async () => {
      console.log('Trying graceful shutdown!');
      await mongoWrapper.close();
      lightStream.disconnect();
      natsWrapper.client.close();
      prometheus.close();
      setTimeout(process.exit(0), 2000);
    };

    process.on('SIGINT', () => {
      stop();
    });
    process.on('SIGTERM', () => {
      stop();
    });
  } catch (error) {
    console.error(error);
  }
};

start();
