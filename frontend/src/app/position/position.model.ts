export interface Position {
  number: number;
  name: string;
  flightbar?: number;
  articleName?: string;
  customerName?: string;
  time: { actual: number; preset: number };
  temperature: { actual: number; preset: number };
  current?: { actual: number; preset: number };
  voltage?: { actual: number; preset: number };
}