"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const departmentSchema = new mongoose_1.Schema({
    departmentName: {
        type: String,
        unique: true,
        required: true,
    },
    departmentHead: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});
exports.default = (0, mongoose_1.model)("Department", departmentSchema);
//# sourceMappingURL=department.model.js.map