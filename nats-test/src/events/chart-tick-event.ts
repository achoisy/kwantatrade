import { Subjects } from './subjects';

export interface ChartTickEvent {
  subject: Subjects.ChartTick;
  data: {
    utm: number;
    bid: number;
    ofr: number;
    epic: string;
  };
}
