import { ApexChart, ApexDataLabels, ApexLegend, ApexNonAxisChartSeries, ApexPlotOptions, ApexTooltip } from "ng-apexcharts";
import { ContactDetail, getCustomer } from "./customer.interface";
import { getDepartment } from "./department.interface";
import { getEmployee } from "./employee.interface";
import { getEnquiry } from "./enquiry.interface";

export interface QuoteItem {
    itemName: string;
    itemDetails: QuoteItemDetail[]
}

export interface QuoteItemDetail {
    _id: string;
    detail: string;
    quantity: number;
    unitCost: number;
    profit: number;
    availability: string;
    dealSelected: boolean;
    supplierName: string;
}

export interface File {
    fileName: string;
    originalname: string;
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
    lpoFiles: File[];
    lpoValue: string;
    lpoSubmitted: boolean;
    enqId: string;
    dealData: dealData;
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
    lpoFiles: [];
    lpoSubmitted: boolean;
    enqId: getEnquiry;
    dealData: dealData;
}

export interface DefaultAndText {
    defaultNote: string;
    text: string;
}

export interface getQuotation {
    quotations: Quotatation[];
    total: number;
}

export interface getDealSheet {
    dealSheet: Quotatation[];
    total: number;
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

export interface dealData {
    dealId: string;
    paymentTerms: string;
    items: [];
    additionalCosts: { name: string, value: number }[];
    savedDate: string;
    seenByApprover: boolean;
    status: string;
    comments: string[]
}


export interface FilterQuote {
    page: number;
    row: number;
    search: string;
    salesPerson: string | null;
    customer: string | null;
    fromDate: string | null;
    toDate: string | null;
}

export interface FilterDeal {
    page: number;
    row: number;
    access?: string;
    userId?: string;
}

export interface nextQuoteData {
    department: getDepartment;
    createdBy: string | undefined;
    date: string;
}

export interface priceDetails {
    totalSellingPrice: number;
    totalCost: number;
    profit: number;
    perc: number;
}

export interface PieChartData {
    name: string;
    value: number;
}

export interface ReportDetails {
    totalValue: number;
    totalWonValue: number;
    totalJobAwarded: number;
    totalLossValue: number;
    pieChartData: PieChartData[];
}

export type PieChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    tooltip: ApexTooltip;
    legend: ApexLegend;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    colors: any;
};


export const QuoteStatusColors: { [key in QuoteStatus]: string } = {
    [QuoteStatus.WorkInProgress]: '#FFA500',  // Orange
    [QuoteStatus.QuoteSubmitted]: '#00BFFF',  // Deep Sky Blue
    [QuoteStatus.UnderNegotiation]: '#FFD700', // Gold
    [QuoteStatus.UnderReview]: '#32CD32',    // Lime Green
    [QuoteStatus.ReadyForSubmission]: '#FF6347', // Tomato
    [QuoteStatus.Won]: '#228B22',  // Forest Green
    [QuoteStatus.Lost]: '#FF0000', // Red
};