/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IService } from "../IService";

export interface IDepartmentService<department, createdepartment = Partial<department>, updatedepartment = Partial<department>, TId = number>
  extends IService<department, createdepartment, updatedepartment, TId> {}