export interface PositionData {
    positions: Record<string, {
      name: string;
      flightbar?: number;
      articleName?: string;
      customerName?: string;
      time: { actual: number; preset: number };
      temperature: { actual: number; preset: number; isPresent: boolean };
      current: { actual: number; preset: number; isPresent: boolean };
      voltage: { actual: number; preset: number; isPresent: boolean };
    }>;
  }
  