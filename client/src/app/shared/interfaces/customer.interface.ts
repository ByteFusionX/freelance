import { getDepartment } from "./department.interface";

interface ContactDetail {
    courtesyTitle: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface getCustomer {
    _id:string;
    department: getDepartment;
    contactDetails: ContactDetail[];
    companyName: string;
    customerEmailId: string;
    contactNo: number;
}