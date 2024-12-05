import { Schema, Document, model, Types } from "mongoose";
import FilesSchema from "./files.model";

interface QuoteItemDetail {
    detail: string;
    quantity: number;
    unitCost: number;
    profit: number;
    availability: string;
    supplierName?: string;
    email?: string;
    phoneNo?: string;
    dealSelected?: boolean;
}

interface QuoteItem {
    itemName: string;
    itemDetails: QuoteItemDetail[]
}

interface AdditionalCost {
    name: string;
    value: number;
}

interface Deal {
    dealId: string;
    paymentTerms: string;
    additionalCosts: AdditionalCost[];
    savedDate: Date;
    seenByApprover: boolean;
    status: string;
    approvedBy:Types.ObjectId;
    comments: string[];
    seenedBySalsePerson: boolean;
    attachments: [];
    updatedItems: QuoteItem[];
}

interface Quotation extends Document {
    quoteId: string;
    client: Types.ObjectId;
    attention: Types.ObjectId;
    date: Date;
    department: Types.ObjectId;
    subject: string;
    currency: string;
    items: QuoteItem[];
    totalDiscount: number;
    customerNote: string;
    termsAndCondition: string;
    status: string;
    createdBy: Types.ObjectId;
    lpoFiles: [];
    dealData: Deal;
    enqId: Types.ObjectId;
    isDeleted: boolean;
}

export enum quoteStatus {
    WorkInProgress = 'Work In Progress',
    QuoteSubmitted = 'Quote Submitted',
    UnderNegotiation = 'Under negotiation',
    UnderReview = 'Under review',
    ReadyForSubmission = 'Ready for submission',
    Won = 'Won',
    Lost = 'Lost',
}

const quoteItemDetailsSchema = new Schema<QuoteItemDetail>({
    detail: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    unitCost: {
        type: Number,
        required: true,
    },
    profit: {
        type: Number,
        required: true,
    },
    availability: {
        type: String,
        required: true,
    },
    supplierName: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
    },
    phoneNo: {
        type: String,
        required: false,
    },
    dealSelected: {
        type: Boolean,
        required: false,
    }
});

const quoteItem = new Schema<QuoteItem>({
    itemName: {
        type: String,
        required: true,
    },
    itemDetails: {
        type: [quoteItemDetailsSchema],
        required: true,
    },
});

const additionalCostSchema = new Schema<AdditionalCost>({
    name: {
        type: String,
        required: false,
    },
    value: {
        type: Number,
        required: false,
    }
});

const dealDatas = new Schema<Deal>({
    dealId: {
        type: String,
        required: false,
    },
    paymentTerms: {
        type: String,
        required: false,
    },
    additionalCosts: {
        type: [additionalCostSchema],
        required: false,
    },
    savedDate: {
        type: Date,
        required: false,
    },
    attachments: [],
    seenByApprover: {
        type: Boolean,
        default: false
    },
    seenedBySalsePerson: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
    },
    comments: {
        type: [String],
    },
    updatedItems: {
        type: [quoteItem],
        required: true,
    },
});

const quotationSchema = new Schema<Quotation>({
    quoteId: {
        type: String,
        required: true,
        unique: true,
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    attention: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    department: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    items: {
        type: [quoteItem],
        required: true,
    },
    totalDiscount: {
        type: Number,
        required: true,
    },
    customerNote: {
        type: String,
        required: true,
    },
    termsAndCondition: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(quoteStatus),
        default: quoteStatus.WorkInProgress,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    lpoFiles: [],
    dealData: {
        type: dealDatas
    },
    enqId: {
        type: Schema.Types.ObjectId,
        ref: 'Enquiry'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

export default model<Quotation>("Quotation", quotationSchema);
