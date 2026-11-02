import { BaseLookupEntity } from "../../base/models/BaseLookupEntity";

export interface location extends BaseLookupEntity {
  address?: string;
  parentId?: number;
}

export interface createlocation extends BaseLookupEntity {
  address?: string;
  parentId?: number;
}

export interface updatelocation extends BaseLookupEntity {
  address?: string;
  parentId?: number;
}