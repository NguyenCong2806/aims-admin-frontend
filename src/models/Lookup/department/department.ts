import { BaseLookupEntity } from "../../BaseEntriy/BaseLookupEntity";

export interface department extends BaseLookupEntity {
  parentId?: number;
  parentDepartment?: department | null;
  managerName?: string;
}

export interface createdepartment extends BaseLookupEntity {
  parentId?: number;
  managerName?: string;
}

export interface updatedepartment extends BaseLookupEntity {
  parentId?: number;
  managerName?: string;
}