/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IService } from "../IService";

export interface IBrandService<brand, creatbrand= Partial<brand>, updatebrand = Partial<brand>, TId = number> extends 
IService<brand, creatbrand, updatebrand, TId>{}