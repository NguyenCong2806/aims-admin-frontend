export abstract class BaseLookupEntity {
   id?: number;
   code?: string;
   name?:string;
   description?:string
   isactive?: boolean = true;
   displayorder?:number = 1;
}
