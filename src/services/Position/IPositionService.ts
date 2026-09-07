/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IService } from "../IService";

export interface IPositionService<position, createposition = Partial<position>, updatedposition = Partial<position>, TId = number>
  extends IService<position, createposition, updatedposition, TId> {}