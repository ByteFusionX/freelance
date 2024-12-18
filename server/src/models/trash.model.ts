import { Schema, Document, model } from "mongoose";

interface Trash {
    deletedFrom: string,
    deletedData: any,
    date: Date,
    deletedBy: any,
}

const trashSchema = new Schema<Trash>({
    deletedFrom: {
        type: String,
        required: true,
        enum: ['Employee', 'Customer', 'Quotation', 'Enquiry', 'Department', 'InternalDepartment', 'Category', 'Job'],
    },
    deletedData: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'deletedFrom',
    },
    date: {
        type: Date,
        required: true,
    },
    deletedBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Employee'
    }
})

export default model<Trash>('Trash', trashSchema)