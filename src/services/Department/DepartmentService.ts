import { createdepartment, department, updatedepartment } from "../../models/Lookup/department/department";
import { Service } from "../Service";
import { IDepartmentService } from "./IDepartmentService";

export class DepartmentService
  extends Service<department, createdepartment, updatedepartment, number>
  implements IDepartmentService<department, createdepartment, updatedepartment, number>
{
  constructor(endpoint = "/department") {
    super(endpoint);
  }
}