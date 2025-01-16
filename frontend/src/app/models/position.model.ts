export interface Position {
  id: number;
  number: number;
  name: string;
  isSelected?: boolean;
  timePreset?: number;
  currentPreset?: number;
  voltagePreset?: number;
  current?: {
    actual: number;
    preset: number;
    isPresent: boolean;
  };
  voltage?: {
    actual: number;
    preset: number;
    isPresent: boolean;
  };
}