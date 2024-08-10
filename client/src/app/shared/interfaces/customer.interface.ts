import { getDepartment } from "./department.interface";

export interface ContactDetail {
    _id?: string
    courtesyTitle: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNo:string;
}

export interface getCustomer {
    _id: string;
    clientRef:string;
    department: getDepartment;
    contactDetails: ContactDetail[];
    companyName: string;
    companyAddress: string;
    customerEmailId: string;
    contactNo: number;
}

export interface getFilteredCustomer {
    total:number,
    customers:getCustomer[]
}

export interface getCustomerByID {
    access:boolean,
    customerData:getCustomer;
}

export interface FilterCustomer {
    page: number;
    row: number;
    createdBy: string | null;
}