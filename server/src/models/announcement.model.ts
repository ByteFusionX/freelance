import { Schema, Document, model } from "mongoose";

interface announcment extends Document {
    title: String
    description: String
    date: Date
    createdDate: Date,
    celeb: boolean
    viewedBy: string[]
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
    viewedBy: {
        type: [String]
    }
});

export default model<announcment>("Announcement", AnnouncementSchema);

