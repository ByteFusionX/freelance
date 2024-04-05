import { ContactDetail, getCustomer } from "./customer.interface";
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
    presale: Presale;
    status: string;
}

export interface getEnquiry {
    _id: string;
    enquiryId: string;
    client: getCustomer;
    contact: ContactDetail;
    department: getDepartment;
    salesPerson: { _id: string, firstName: string, lastName: string }[];
    title: string;
    date: string;
    attachments: Files[];
    preSale: {
        presalePerson: string;
        presaleFile: Files[] | null;
    };
    assignedFiles: Files[];
    status: string;
}

export interface EnquiryTable {
    total: number;
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

export interface FilterEnquiry {
    page: number;
    row: number;
    salesPerson: string | null;
    status: string | null;
    fromDate: string | null;
    toDate: string | null;
}

export interface Files {
    fieldname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    destination: string,
    filename: string,
    path: string,
    size: number,
}

export interface Presale {
    presalePerson: string;
    presaleFile: File[];
    presalePersonName:string;
};