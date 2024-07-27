import { Schema, Document, model, Types } from "mongoose";

interface QuoteItemDetail {
    detail: string;
    quantity: number;
    unitCost: number;
    profit: number;
    availability: string;
}


interface QuoteItem {
    itemName: string;
    itemDetails: QuoteItemDetail[]
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
    lpoSubmitted: boolean;
    enqId: Types.ObjectId;
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
    lpoSubmitted: {
        type: Boolean,
        default: false
    },
    enqId: {
        type: Schema.Types.ObjectId,
        ref: 'Enquiry'
    },
});

export default model<Quotation>("Quotation", quotationSchema);
