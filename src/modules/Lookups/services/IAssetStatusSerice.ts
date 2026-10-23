/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IService } from "../../base/IService";

export interface IAssetStatusService<assetstatus, createassetstatus= Partial<assetstatus>, updateassetstatus = Partial<assetstatus>, 
TId = number> extends 
IService<assetstatus, createassetstatus, updateassetstatus, TId>{}