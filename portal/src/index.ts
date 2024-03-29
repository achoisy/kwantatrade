// Create a uWebsocket server
// Listen to Chart events and server them throught different channel
import { natsWrapper, mongoWrapper, Prometheus } from '@quantatrading/common';
import { socketio } from './services/socketio-server';
import { ChartTickListener } from './events/chart-tick-listener';
import { StreamStatusListener } from './events/streamer-status-listener';
import http from 'http';

// Check for env before starting service
import './env-check';

// Set prometheus mettrics monitoring
const prometheus = new Prometheus({ serviceName: 'portal' });

const start = async () => {
  console.log('Starting up Portal service...');
  try {
    const httpServer = http.createServer();
    httpServer.listen(4000);

    // Connect to NATS Streamming Server
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID!,
      process.env.NATS_CLIENT_ID!,
      process.env.NATS_URL!
    );

    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed !');
    });

    // Connect to mongoDb cold and hot database
    await mongoWrapper.connect({
      coldMongoUri: process.env.MONGO_URI!,
    });

    // Connect socketio
    await socketio.connect(httpServer).then(() => {
      socketio.listener();
      console.log('SocketIo connected');
    });

    // Set CHART:TICK listener
    new ChartTickListener(natsWrapper.client).listen();

    // Set StreamerStatus listener
    new StreamStatusListener(natsWrapper.client).listen();

    // Gracefull shutdown function
    const stop = async () => {
      console.log('Trying graceful shutdown!');
      await mongoWrapper.close();
      natsWrapper.client.close();
      socketio.disconnect();
      httpServer.close();
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
