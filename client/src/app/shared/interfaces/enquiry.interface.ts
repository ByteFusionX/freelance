export interface Enquiry {
    enqId: string;
    client: string;
    poc: string;
    department: string;
    salesPerson: string;
    title: string;
    date: string;
    attachment: File[]
    presale: {
        presalePerson: string;
        presaleFile: File[];
    }
}