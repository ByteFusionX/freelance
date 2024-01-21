import { getCustomer } from "./customer.interface";
import { getDepartment } from "./department.interface";

export interface Enquiry {
    enquiryId: string;
    client: string;
    contact: string;
    department: string;
    salesPerson: string;
    title: string;
    date: string;
    attachments: File[];
    presale: {
        presalePerson: string;
        presaleFile: File[];
    };
    status: string;
}

export interface getEnquiry {
    _id: string;
    enquiryId: string;
    client: getCustomer;
    contact: string;
    department: getDepartment;
    salesPerson: { _id: string, firstName: string, lastName: string };
    title: string;
    date: string;
    attachments: File[];
    preSale: {
        presalePerson: string;
        presaleFile: File[];
    };
    status: string;
}

export interface EnquiryTable{
    total:number;
    enquiry: getEnquiry[];
}

export interface TotalEnquiry {
    total: number;
    department: getDepartment[];
    enquiry?: getEnquiry[];
}

export interface MonthlyEnquiry {
    total: number;
    department: getDepartment[];
    enquiry?: getEnquiry[];
    year: number;
    month: number;
}