import { Schema, Document, model, ObjectId } from "mongoose";

interface preSales extends Document {
    enquiryId: String
    description: String
    employee: ObjectId
    attachment: string
    createdBy: ObjectId,
    preSaleAttachement: string[]
}

const preSalesSchema = new Schema<preSales>({
    enquiryId: {
        type: Schema.Types.ObjectId,
        ref: 'Enquiry',
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    attachment: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    preSaleAttachement: {
        type: [String],
        required: true
    }

});

export default model<preSales>("preSales", preSalesSchema);

