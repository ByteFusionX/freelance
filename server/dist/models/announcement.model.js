"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AnnouncementSchema = new mongoose_1.Schema({
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
    date: {
        type: Date,
        required: true
    },
    celeb: {
        type: Boolean,
        required: true
    }
});
exports.default = (0, mongoose_1.model)("Announcement", AnnouncementSchema);
//# sourceMappingURL=announcement.model.js.map