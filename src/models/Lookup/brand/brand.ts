import { BaseLookupEntity } from "../../BaseEntriy/BaseLookupEntity";

export interface brand extends BaseLookupEntity{
  website?: string;
  supportcontact?:string;
}

export interface creatbrand extends BaseLookupEntity{
  website?: string;
  created_at?: Date;
}
export interface updatebrand extends BaseLookupEntity{
  website?: string;
  created_at?: Date;
}