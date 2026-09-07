import { BaseLookupEntity } from "../../BaseEntriy/BaseLookupEntity";

export interface position extends BaseLookupEntity {
  departmentId?: number;
}

export interface createposition extends BaseLookupEntity {
  departmentId?: number;
}

export interface updateposition extends BaseLookupEntity {
  departmentId?: number;
}