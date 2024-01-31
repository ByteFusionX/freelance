import { ContactDetail, getCustomer } from "./customer.interface";
import { getDepartment } from "./department.interface";
import { getEmployee } from "./employee.interface";

export interface quoteItem {
    detail: string;
    quantity: number;
    unitCost: number;
    profit: number;
    availability: string;
}

export interface Quotatation {
    _id?: string;
    quoteId?: string;
    client: getCustomer;
    attention: ContactDetail;
    date: string;
    department: getDepartment;
    subject: string;
    currenct: string;
    items: quoteItem[];
    totalDiscount: number;
    customerNote: string;
    termsAndCondition: string;
    createdBy: getEmployee;
    status: QuoteStatus;
}

export interface getQuotation {
    quotations: Quotatation[];
    total:number;
}

export interface quotatationForm {
    _id?: string;
    quoteId?: string;
    client: string | getCustomer;
    attention: string | ContactDetail | undefined;
    date: string | null;
    department: string | getDepartment | undefined;
    subject: string;
    currenct: string;
    items: quoteItem[];
    totalDiscount: number;
    customerNote: string;
    termsAndCondition: string;
    createdBy: string | getEmployee | undefined;
    status: QuoteStatus;
}

export enum QuoteStatus {
    WorkInProgress = 'Work In Progress',
    QuoteSubmitted = 'Quote Submitted',
    UnderNegotiation = 'Under negotiation',
    UnderReview = 'Under review',
    ReadyForSubmission = 'Ready for submission',
    Won = 'Won',
    Lost = 'Lost',
}


export interface FilterQuote {
    page: number;
    row: number;
    salesPerson: string | null;
    customer: string | null;
    fromDate: string | null;
    toDate: string | null;
}
