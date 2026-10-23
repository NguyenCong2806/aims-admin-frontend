/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IService } from "../../base/IService";

export interface IAssetTypeService<assettype, creatassettype= Partial<assettype>, updateassettype = Partial<assettype>, TId = number> extends 
IService<assettype, creatassettype, updateassettype, TId>{}