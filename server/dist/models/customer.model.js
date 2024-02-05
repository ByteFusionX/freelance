"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const contactDetailSchema = new mongoose_1.Schema({
    courtesyTitle: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
});
const customerSchema = new mongoose_1.Schema({
    department: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
    },
    contactDetails: [
        {
            type: contactDetailSchema,
            required: true,
        },
    ],
    companyName: {
        type: String,
        required: true,
    },
    customerEmailId: {
        type: String,
        required: true,
    },
    contactNo: {
        type: Number,
        required: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
});
exports.default = (0, mongoose_1.model)("Customer", customerSchema);
//# sourceMappingURL=customer.model.js.map