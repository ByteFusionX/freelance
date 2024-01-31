import { getDepartment } from "./department.interface";

export interface ContactDetail {
    _id?: string
    courtesyTitle: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface getCustomer {
    _id: string;
    department: getDepartment;
    contactDetails: ContactDetail[];
    companyName: string;
    customerEmailId: string;
    contactNo: number;
}

export interface getFilteredCustomer {
    total:number,
    customers:getCustomer[]
}



export interface FilterCustomer {
    page: number;
    row: number;
    createdBy: string | null;
}