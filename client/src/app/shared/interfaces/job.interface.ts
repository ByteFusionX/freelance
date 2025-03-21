import { Quotatation } from "./quotation.interface";

export interface filterJob {
    search:string;
    page: number;
    row: number;
    status: number;
    selectedMonth?:number;
    selectedYear?:number;
}

export interface getJob {
    _id: string;
    jobId:string;
    quoteId:string;
    quotation:Quotatation[];
    status:string;
    createdDate:string
}

export interface Files {
    fieldname: string,
    originalname: string,
}

export interface JobTable {
    total: number;
    totalLpo: number;
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