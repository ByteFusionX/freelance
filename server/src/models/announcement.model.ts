import { Schema, Document, model } from "mongoose";

interface announcment extends Document {
    title: String
    description: String
    date: Date
    createdDate: Date,
    celeb:boolean
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
    },
    celeb :{
        type:Boolean,
        required: true
    }
});

export default model<announcment>("Announcement", AnnouncementSchema);

