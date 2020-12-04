import { Server, Socket } from 'socket.io';
import { Model } from 'mongoose';
import {
  mongoWrapper,
  chartSchema,
  ChartDoc,
  StreamStatusEvent,
  ChartTickEvent,
  JoinChartEvent,
  LeaveChartEvent,
  GetChartHistoryEvent,
  Subjects,
  EventNames,
  Epics,
} from '@quantatrading/common';
import http from 'http';
// import Chart from '../models/cold-chart';

class Socketio {
  private _io?: Server;

  get io() {
    if (!this._io) {
      throw new Error('Cannot access io server before connecting');
    }
    return this._io;
  }

  ChartModel(epic: Epics): Model<ChartDoc, {}> {
    return mongoWrapper.coldMongo.model<ChartDoc>('Chart', chartSchema, epic);
  }

  pubStatus(data: StreamStatusEvent['data']) {
    this.io.emit(Subjects.StreamStatus, data);
  }

  pubChartTick(data: ChartTickEvent['data']) {
    this.io.to(data.epic).emit(Subjects.ChartTick, data);
  }

  listener() {
    this.io.on('connection', (socket: Socket) => {
      // Join epic chart stream
      socket.on(EventNames.joinChart, ({ epic }: JoinChartEvent['data']) => {
        console.log(`User ${socket.id} join ${epic} room`);
        socket.join(epic);
      });

      // Leave epic chart stream
      socket.on(EventNames.leaveChart, ({ epic }: LeaveChartEvent['data']) => {
        console.log(`User ${socket.id} leave ${epic} room`);
        socket.leave(epic);
      });

      // Lsten for historical data request
      socket.on(
        EventNames.chartHistory,
        async (data: GetChartHistoryEvent['queryData'], callback) => {
          try {
            // Check Epics list for avalaible epic
            const epic = Object.values(Epics).find((x) => x == data.epic);
            if (!epic) {
              throw new Error('Epic string error');
            }
            // Run query and send it back
            const queryResult = await this.ChartModel(epic).find(
              data.filter,
              data.projection,
              data.options
            );
            const returnData: GetChartHistoryEvent['returnData'] = {
              epic,
              queryResult,
            };
            // socket.emit(EventNames.chartHistory, returnData);
            callback(returnData);
          } catch (error) {
            console.error(error);
          }
        }
      );
    });
  }

  connect(srv: http.Server): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this._io = new Server(srv, {
          cors: {
            origin: true,
            //credentials: false
          },
        });
        this._io.use((socket, next) => {
          // Get client app token for futur verification
          const { apikey }: { apikey?: string } = socket.handshake.query;
          //TODO: Add token validation for client connection JWT + PASSPORT
          if (apikey) {
            return next();
          }
          console.log('Connection error !');
          return next(new Error('authentication error'));
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    this.io.close();
  }
}

export const socketio = new Socketio();
