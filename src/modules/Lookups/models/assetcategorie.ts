import { BaseLookupEntity } from "../../base/models/BaseLookupEntity";

export interface assetcategorie extends BaseLookupEntity{
  parentId?: number;
}

export interface creatassetcategorie extends BaseLookupEntity{
 parentId?: number;
}
export interface updateassetcategorie extends BaseLookupEntity{
 parentId?: number;
}