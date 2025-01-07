export interface Sequence {
  id?: number;
  positionId: string;
  orderNumber: number;
  timePreset?: number;
  currentPreset?: number;
  voltagePreset?: number;
  position?: {
    id: number;
    number: number;
    name: string;
  };
} 