/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IService } from "../../base/IService";

export interface IAssetCategoryService<assetcategorie, creatassetcategorie= Partial<assetcategorie>, updateassetcategorie = Partial<assetcategorie>, TId = number> extends 
IService<assetcategorie, creatassetcategorie, updateassetcategorie, TId>{}