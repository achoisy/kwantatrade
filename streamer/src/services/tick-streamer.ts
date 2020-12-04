import { Stan } from 'node-nats-streaming';
import {
  IgCredentialEvent,
  Types,
  Epics,
  ChartTickEvent,
  StreamStatusEvent,
} from '@quantatrading/common';
import { LightstreamerClient, Subscription } from 'lightstreamer-client-node';
import { IgCredentialListener } from '../events/ig-credential-listener';
import { StreamerStatusPublisher } from '../events/streamer-status-publisher';
import { ChartTickPublisher } from '../events/chart-tick-publisher';
import { TickDbHandler } from './tick-db-handler';

export class LightStream {
  private _lsClient?: LightstreamerClient;
  private subscription: Subscription;
  private igConnect?: IgCredentialListener;
  private _connectRetry = 5;

  private tickDbHandler: TickDbHandler;

  constructor(private natsClient: Stan) {
    this.subscription = new Subscription(
      'DISTINCT',
      `CHART:${process.env.EPIC}:TICK`,
      ['BID', 'OFR', 'UTM']
    );

    this.tickDbHandler = new TickDbHandler();
  }

  get lsClient() {
    if (!this._lsClient) {
      throw new Error('LigthStream client must be connected first');
    }
    return this._lsClient;
  }

  get igCredential(): IgCredentialEvent['data'] {
    if (!this.igConnect?.igCredential) {
      throw new Error('Ig Credential require before connecting');
    }
    return this.igConnect.igCredential;
  }

  getEpic(epicToValidate: string): Epics {
    const epic = Object.values(Epics).find((x) => x == epicToValidate);
    if (!epic) {
      throw new Error('Epic string error');
    }
    return epic;
  }

  connectRetryDec() {
    if (this._connectRetry > 0) {
      this._connectRetry -= 1;
    }
  }

  connectRetryReset() {
    this._connectRetry = 5;
  }

  get connectRetry() {
    return this._connectRetry;
  }

  // Set or update LightStream USER and PASSWORD
  setLsCredential() {
    this.lsClient.connectionDetails.setUser(this.igCredential.activeAccountId);
    this.lsClient.connectionDetails.setPassword(
      this.igCredential.lightStreamPassword
    );
  }

  setLsListener() {
    // Check for current listener
    const lsListeners = this.lsClient.getListeners();
    if (lsListeners.length > 0) {
      // Removing actual listener
      lsListeners.map((listener) => {
        this.lsClient.removeListener(listener);
      });
    }

    // [this] is not working in ClientListener
    const natsClient = this.natsClient;
    const reconnect = this.reconnect;
    const connectRetryReset = this.connectRetryReset;
    const getEpic = this.getEpic;

    this.lsClient.addListener({
      onStatusChange: function (status) {
        const data: StreamStatusEvent['data'] = {
          type: Types.StatusChange,
          message: status,
          timestamp: Date.now(),
          epic: getEpic(process.env.EPIC!),
          natsClientId: process.env.NATS_CLIENT_ID!,
        };
        // Send server status to Nats server
        console.log('LightStream status: ', JSON.stringify(data));
        new StreamerStatusPublisher(natsClient).publish(data);

        // If CONNECTED then reset reconnection counter to initial value
        if (status == 'CONNECTED:STREAM-SENSING') {
          connectRetryReset();
        }
      },
      onServerError: function (errorCode, errorMessage) {
        console.log('status Error', errorMessage);
        const data: StreamStatusEvent['data'] = {
          type: Types.ServerError,
          message: `error_code: ${errorCode}, ${errorMessage}`,
          timestamp: Date.now(),
          epic: getEpic(process.env.EPIC!),
          natsClientId: process.env.NATS_CLIENT_ID!,
        };
        // Send server error to Nats server
        console.log('LightStream error: ', JSON.stringify(data));
        new StreamerStatusPublisher(natsClient).publish(data);

        // Handle here reconnection in case of disconnecting due to bad password
        // ErrorCode 1: user/password check failed
        // Get new password and retry connection
        if (errorCode == 1) {
          reconnect();
        }
      },
    });
  }

  setLsSubListener() {
    // Check for current subscription listeners
    // and remove them if any
    const subscriptionList = this.subscription.getListeners();
    if (subscriptionList.length > 0) {
      subscriptionList.map((subs) => {
        this.subscription.removeListener(subs);
      });
    }

    this.subscription.addListener({
      onRealMaxFrequency: (frequency) => {
        // Send frequency to Natserver for information
        // on server to IG streamer connection speed
        const data: StreamStatusEvent['data'] = {
          type: Types.MaxFrequency,
          message: frequency,
          timestamp: Date.now(),
          epic: this.getEpic(process.env.EPIC!),
          natsClientId: process.env.NATS_CLIENT_ID!,
        };
        new StreamerStatusPublisher(this.natsClient).publish(data);
      },
      onItemUpdate: (itemUpdate) => {
        if (itemUpdate.getValue('BID') && itemUpdate.getValue('OFR')) {
          const data: ChartTickEvent['data'] = {
            utm: Number(itemUpdate.getValue('UTM')),
            bid: Number(itemUpdate.getValue('BID')),
            ofr: Number(itemUpdate.getValue('OFR')),
            epic: itemUpdate.getItemName().split(':')[1],
          };
          // Try to add tick data to database
          // if valid then publish chartTickEvent
          this.tickDbHandler.save(data).then((valid) => {
            if (valid) {
              new ChartTickPublisher(this.natsClient).publish(data);
            }
          });
        }
      },
    });
  }

  // Get IG credential
  // setup LightStream Listener for connection satus change
  // Connect to IG LightStream server
  async connect() {
    try {
      this.igConnect = new IgCredentialListener(this.natsClient);
      // Wait for ig credential before try connect to LightStream server
      await this.igConnect.getCredential();
      this._lsClient = new LightstreamerClient(
        this.igCredential.lightstreamerEndpoint
      );
      this.setLsCredential();
      this.setLsListener();
      this.lsClient.connect();
      this.subscribe();
    } catch (error) {
      throw new Error(error);
    }
  }

  reconnect() {
    // Before trying to reconnect, check if still DISCONNECTED
    // and connection retry attemp not yet reach
    if (this.lsClient.getStatus() == 'DISCONNECTED' && this.connectRetry > 0) {
      this.setLsCredential();
      this.connectRetryDec();
      this.lsClient.connect();
    }
  }

  // LightStream Chart subscriptions - Tick data
  subscribe() {
    this.setLsSubListener();
    this.lsClient.subscribe(this.subscription);
  }

  // Close LightStream
  disconnect() {
    this.lsClient.disconnect();
    console.log('LightStream connection closed !');
  }
}
