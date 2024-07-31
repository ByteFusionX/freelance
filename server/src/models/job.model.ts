import { Schema, Document, model, Types } from "mongoose";

interface Job extends Document {
    quoteId: Types.ObjectId;
    jobId: string;
    status: string;
    createdDate: Date;
}

export enum jobStatus {
    WorkInProgress = 'Work In Progress',
    Delivered = 'Delivered',
    PartiallyDelivered = 'Partially Delivered',
    Completed = 'Completed',
    Cancelled = 'Cancelled',
    OnHold = 'On Hold',
    Inovoiced = 'Inovoiced',
}

const jobSchema = new Schema<Job>({
    quoteId: {
        type: Schema.Types.ObjectId,
        ref: 'Quotation',
        required: true,
    },
    jobId: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: Object.values(jobStatus),
        default: jobStatus.WorkInProgress,
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});

export default model<Job>("Job", jobSchema);
