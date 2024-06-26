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
    preSale: { presalePerson: Types.ObjectId, presaleFiles: [] };
    assignedFiles: []
    status: string;
    attachments: []
}

const preSaleSchema = new Schema({
    presalePerson: {
        type: String
    },
    presaleFiles: []
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
    preSale: [preSaleSchema],
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

