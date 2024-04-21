import { Quotatation } from "./quotation.interface";

export interface filterJob {
    page: number;
    row: number;
    status: number;
}

export interface getJob {
    _id: string;
    jobId:string;
    enquiryId: string;
    quoteId:string;
    quotation:Quotatation;
    status:string;
    createdDate:string
}

export interface Files {
    fieldname: string,
    originalname: string,
}

export interface JobTable {
    total: number;
    job: getJob[];
}

export enum JobStatus {
    WorkInProgress = 'Work In Progress',
    Delivered = 'Delivered',
    partiallyDelivered = 'Partially Delivered',
    completed = 'Completed',
    cancelled = 'Cancelled',
    onHold = 'On Hold',
    invoiced = 'Invoiced'
}