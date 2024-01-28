export interface Enquiry {
    enquiryId: string;
    client: string;
    contact: string;
    department: string;
    salesPerson: string;
    title: string;
    date: string | Date;
    attachments: string[];
    preSale: {
        presalePerson: string;
        presaleFiles: string[];
    };
    status: string;
}