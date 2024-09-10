import { Schema, Document, model, Types } from "mongoose";
import { File } from "../interface/enquiry.interface";
import FilesSchema from "./files.model";

interface Enquiry extends Document {
    enquiryId: String
    client: Types.ObjectId;
    contact: Types.ObjectId;
    department: Types.ObjectId;
    salesPerson: Types.ObjectId;
    title: String;
    date: string | number | Date;
    createdDate: Date;
    preSale: { presalePerson: Types.ObjectId, items: ItemDetail[], comment: string, revisionComment: string[] };
    assignedFiles: []
    status: string;
    attachments: []
}

interface ItemDetail {
    detail: string;
    quantity: number;
    unitCost: number;
    profit: number;
    availability: string;
}

interface QuoteItem {
    itemName: string;
    itemDetails: ItemDetail[]
}

const feedbackSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: () => new Types.ObjectId() 
    },
    employeeId: {
        type: Types.ObjectId
    },
    comment: {
        type: String
    },
    feedback: {
        type: String
    },
    requestedDate: {
        type: Date
    },
    seenByFeedbackProvider: {
        type: Boolean,
        default: false
    },
    seenByFeedbackRequester: {
        type: Boolean,
        default: false
    },
})

const estimationSchema = new Schema({
    items: [],
    currency: {
        type: String
    },
    totalDiscount: {
        type: Number
    },
    presaleNote: {
        type: String
    },
})

const preSaleSchema = new Schema({
    presalePerson: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
    },
    estimations: {
        type: estimationSchema
    },
    presaleFiles: [],
    comment: {
        type: String
    },
    feedback: {
        type: [feedbackSchema]
    },
    newFeedbackAccess:{
        type:Boolean,
        default:true
    },
    seenbyEmployee: {
        type: Boolean,
        default: false
    },
    seenbySalesPerson: {
        type: Boolean,
        default: false
    },
    revisionComment: {
        type: [String],
        default: []
    }
})


const enquirySchema = new Schema<Enquiry>({
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    contact: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    department: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
    },
    salesPerson: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now()
    },
    attachments: [FilesSchema],
    preSale: preSaleSchema,
    assignedFiles: [FilesSchema],
    enquiryId: {
        type: String,
        unique: true,
        required: true,
    },
    status: {
        type: String,
        required: true
    },

});

export default model<Enquiry>("Enquiry", enquirySchema);

