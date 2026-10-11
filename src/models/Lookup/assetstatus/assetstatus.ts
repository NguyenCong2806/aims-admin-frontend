import { BaseLookupEntity } from "../../BaseEntriy/BaseLookupEntity";

export interface assetstatus extends BaseLookupEntity{
  colorCode?: string;
  allowAllocation?: boolean;
}

export interface createassetstatus extends BaseLookupEntity{
  colorCode?: string;
  allowAllocation?: boolean;
}
export interface updateassetstatus extends BaseLookupEntity{
  colorCode?: string;
  allowAllocation?: boolean;
}