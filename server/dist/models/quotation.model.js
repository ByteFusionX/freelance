"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quoteStatus = void 0;
const mongoose_1 = require("mongoose");
var quoteStatus;
(function (quoteStatus) {
    quoteStatus["WorkInProgress"] = "Work In Progress";
    quoteStatus["QuoteSubmitted"] = "Quote Submitted";
    quoteStatus["UnderNegotiation"] = "Under negotiation";
    quoteStatus["UnderReview"] = "Under review";
    quoteStatus["ReadyForSubmission"] = "Ready for submission";
    quoteStatus["Won"] = "Won";
    quoteStatus["Lost"] = "Lost";
})(quoteStatus || (exports.quoteStatus = quoteStatus = {}));
const quoteItemSchema = new mongoose_1.Schema({
    detail: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    unitCost: {
        type: Number,
        required: true,
    },
    profit: {
        type: Number,
        required: true,
    },
    availability: {
        type: String,
        required: true,
    },
});
const quotationSchema = new mongoose_1.Schema({
    quoteId: {
        type: String,
        required: true,
        unique: true,
    },
    client: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    attention: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    department: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    items: {
        type: [quoteItemSchema],
        required: true,
    },
    totalDiscount: {
        type: Number,
        required: true,
    },
    customerNote: {
        type: String,
        required: true,
    },
    termsAndCondition: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(quoteStatus),
        default: quoteStatus.WorkInProgress,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
});
exports.default = (0, mongoose_1.model)("Quotation", quotationSchema);
//# sourceMappingURL=quotation.model.js.map