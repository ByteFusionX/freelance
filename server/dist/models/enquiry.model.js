"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const preSaleSchema = new mongoose_1.Schema({
    presalePerson: {
        type: String
    },
    presaleFiles: []
});
const enquirySchema = new mongoose_1.Schema({
    client: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    contact: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    department: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
    },
    salesPerson: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now()
    },
    attachments: [],
    preSale: [preSaleSchema],
    enquiryId: {
        type: String,
        unique: true,
        required: true,
    },
    status: {
        type: String,
        required: true
    },
});
exports.default = (0, mongoose_1.model)("Enquiry", enquirySchema);
//# sourceMappingURL=enquiry.model.js.map