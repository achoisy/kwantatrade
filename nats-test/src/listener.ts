import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { IgCredentialListener } from './events/ig-credential-listener';
import { ChartTickListener } from './events/tick-listener';

console.clear();
// random string can e solve with kubctl
const stan = nats.connect('trading', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('Listener connected');

  stan.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });

  new IgCredentialListener(stan).listen();
  new ChartTickListener(stan).listen();
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
