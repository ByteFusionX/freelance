import { ContactDetail, getCustomer } from "./customer.interface";
import { getDepartment } from "./department.interface";
import { getEmployee } from "./employee.interface";
import { getEnquiry } from "./enquiry.interface";

export interface QuoteItem {
    itemName: string;
    itemDetails: QuoteItemDetail[]
}

export interface QuoteItemDetail {
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
    items: QuoteItem[];
    totalDiscount: number;
    customerNote: DefaultAndText;
    termsAndCondition: DefaultAndText;
    createdBy: getEmployee;
    status: QuoteStatus;
    lpoFiles:[];
    lpoSubmitted:boolean;
    enqId:string;
}

export interface getQuotatation {
    _id?: string;
    quoteId?: string;
    client: getCustomer;
    attention: ContactDetail;
    date: string;
    department: getDepartment;
    subject: string;
    currenct: string;
    items: QuoteItem[];
    totalDiscount: number;
    customerNote: DefaultAndText;
    termsAndCondition: DefaultAndText;
    createdBy: getEmployee;
    status: QuoteStatus;
    lpoFiles:[];
    lpoSubmitted:boolean;
    enqId:getEnquiry;
}

export interface DefaultAndText {
    defaultNote: string;
    text: string;
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
    items: QuoteItem[];
    totalDiscount: number;
    customerNote: DefaultAndText;
    termsAndCondition: DefaultAndText;
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
