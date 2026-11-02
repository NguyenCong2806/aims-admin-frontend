/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IService } from "../../base/IService";

export interface ILocationService<location, createlocation = Partial<location>, updatedlocation = Partial<location>, TId = number>
  extends IService<location, createlocation, updatedlocation, TId> {}