import { Schema, Document, model, ObjectId } from "mongoose";

interface preSales extends Document {
    equiryId: String
    description: String
    employee: ObjectId
    attachment: string
}

const preSalesSchema = new Schema<preSales>({
    equiryId: {
        type: String,
        unique: true,
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
    }
});

export default model<preSales>("preSales", preSalesSchema);

