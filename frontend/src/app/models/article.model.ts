export interface Article {
  id?: number;
  title: string;
  number: string;
  customer: string;
  area: string;
  drainage: string;
  anodic: string;
  note?: string;
  createdDate?: Date;
  createdBy?: string;
  modifiedDate?: Date;
  modifiedBy?: string;
  sequence?: Sequence[];
  selected?: boolean;
}

export interface Sequence {
  positionId: string;
  orderNumber: number;
  timePreset: string;
  currentPreset: string;
  voltagePreset: string;
  positionName?: string;
}