// import { ColdChart } from '../models/cold-chart';
// import { HotChart } from '../models/hot-chart';
import {
  ChartTickEvent,
  mongoWrapper,
  chartSchema,
  ChartDoc,
} from '@quantatrading/common';

export class TickDbHandler {
  private coldChartModel;
  private hotChartModel;

  constructor() {
    this.coldChartModel = mongoWrapper.coldMongo.model<ChartDoc>(
      'ColdChart',
      chartSchema,
      process.env.EPIC
    );

    chartSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });
    this.hotChartModel = mongoWrapper.hotMongo.model<ChartDoc>(
      'HotChart',
      chartSchema,
      process.env.EPIC
    );
  }

  timeCheck(data: ChartTickEvent['data']): boolean {
    // Check if data is not more then 600 second old and return true
    // else return false.
    // To prevent from adding old data in Hot mongo
    // and then in cold mongo where it may already saved
    if (data.utm + 600 * 1000 > Date.now()) {
      return true;
    }
    return false;
  }

  async save(data: ChartTickEvent['data']) {
    try {
      if (this.timeCheck(data)) {
        const hotCheck = await this.hotChartModel.findOne({
          utm: data.utm,
        });
        if (hotCheck) {
          // this tick data is saved already, discard this data
          return false;
        }
        //const hotChart = HotChart.build(this.data);
        const hotChart = new this.hotChartModel(data);

        // Wait for the hotChart save...
        // If any concurency error return false
        await hotChart.save();

        const coldChart = new this.coldChartModel(data);
        // No need to wait for coldChart...
        // Return true to send tick data to client asap
        coldChart.save();

        return true;
      }

      return false;
    } catch (error) {
      console.error('TickDbHandler.process ', error);
      return false;
    }
  }
}
