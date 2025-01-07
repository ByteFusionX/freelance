import { Schema, model } from "mongoose";

interface Notification {
    type: string; // The type of notification (e.g., 'Info', 'Warning', 'Alert')
    title: string; // Brief title for the notification
    message: string; // Detailed message content
    recipients: any[]; // Array of recipient IDs (can be employees or other entities)
    sentBy: any; // Sender ID (can be an employee or system)
    date: Date; // Timestamp of the notification
    referenceId: any; // Link to related entities like events, tasks, or projects
    referenceType: string; // Type of the related entity (e.g., 'Event', 'Task')
    additionalData: any; // JSON object for extensibility
}


const notificationSchema = new Schema<Notification>({
    type: {
        type: String,
        required: true,
        enum: ['Event'], // Extendable
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    recipients: {
        type: [{
            objectId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
            status: { type: String, enum: ['unread', 'read', 'archived'], default: 'unread' }
        }],
        required: true,
    },
    sentBy: {
        type: Schema.Types.ObjectId,
        ref: 'Employee', // System or employee who sent the notification
    },
    date: {
        type: Date,
        default: Date.now,
    },
    referenceType: {
        type: String,
        required: true,
        enum: ['Employee', 'Customer', 'Quotation', 'Enquiry', 'Department', 'InternalDepartment', 'Category', 'Job'],
    },
    referenceId: {
        type: Schema.Types.ObjectId,
        refPath: 'referenceType',
    },
    additionalData: {
        type: Schema.Types.Mixed,
        default: {},
    },
});

export default model<Notification>('Notification', notificationSchema);
