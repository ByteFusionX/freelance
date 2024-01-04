import { Schema, Document, model } from "mongoose";

interface announcment extends Document {
    title: String
    description: String
    date: Date
    createdDate: Date
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
        default: Date.now
    },
    date :{
        type:Date,
        required:true
    }
});

export default model<announcment>("Announcement", AnnouncementSchema);

