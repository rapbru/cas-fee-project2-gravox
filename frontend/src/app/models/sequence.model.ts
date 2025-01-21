export interface Sequence {
  id?: number;
  positionId: string;
  orderNumber: number;
  timePreset?: number;
  currentPreset?: number;
  voltagePreset?: number;
  positionName?: string;
  position?: {
    id: number;
    number: number;
    name: string;
  };
} 