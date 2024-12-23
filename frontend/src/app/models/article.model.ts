export interface Article {
  id?: string;
  selected?: boolean;
  title: {
    value: string;
  };
  number: {
    value: string;
  };
  customer: {
    value: string;
  };
  area: {
    value: string;
  };
  drainage: {
    value: string;
  };
  anodic: {
    value: string;
  };
  createdBy: {
    value: string;
  };
  note: {
    value: string;
  };
  sequence: Sequence[];
  createdDate?: string;
  modifiedBy?: {
    value: string;
  };
  modifiedDate?: string;
}

export interface Sequence {
  positionId: number;
  orderNumber: number;
  timePreset: number;
  currentPreset: number;
  voltagePreset: number | null;
}