import { Schema, Document, model } from "mongoose";

interface announcment extends Document {
    title: String
    description: String
    date: Date
    createdDate: Date,
    celeb: boolean
    userId: string[]
}

const AnnouncementSchema = new Schema<announcment>({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    createdDate: {
        type: Date,
        default: () => new Date().setHours(0, 0, 0, 0)
    },
    date: {
        type: Date,
        required: true
    },
    celeb: {
        type: Boolean,
        required: true
    },
    userId: {
        type: [String]
    }
});

export default model<announcment>("Announcement", AnnouncementSchema);

