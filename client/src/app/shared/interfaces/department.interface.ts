import { getEmployee } from "./employee.interface";

export interface getDepartment {
    _id?:string;
    departmentName: string;
    departmentHead: string;
    createdDate: number;
    employee?:getEmployee[]
}