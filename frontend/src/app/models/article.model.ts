import { Sequence } from './sequence.model';

export interface Article {
  id?: number;
  title: string;
  number: number;
  customer: string;
  area: number;
  drainage: number;
  anodic: number;
  note?: string;
  createdDate?: Date;
  createdBy?: string;
  modifiedDate?: Date;
  modifiedBy?: string;
  sequence?: Sequence[];
  selected?: boolean;
}