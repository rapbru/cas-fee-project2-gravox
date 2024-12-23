export interface Article {
  id?: string | number;
  selected?: boolean;
  title: string;
  number: string;
  customer: string;
  area: string;
  drainage: string;
  anodic: string;
  note: string;
  sequence: Sequence[];
  createdDate?: string;
  createdBy?: string;
  modifiedDate?: string;
  modifiedBy?: string;
}

export interface Sequence {
  positionId: number;
  orderNumber: number;
  timePreset: number;
  currentPreset: number;
  voltagePreset: number | null;
}