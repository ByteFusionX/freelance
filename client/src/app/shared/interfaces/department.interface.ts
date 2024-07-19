import { getEmployee } from "./employee.interface";

export interface getDepartment {
    _id?:string;
    departmentName: string;
    departmentHead: getEmployee[];
    createdDate: number;
}

export interface Department{
    departmentName:string,
    departmentHead:string,
    createdDate:number
}

