"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
var UserRole;
(function (UserRole) {
    UserRole[UserRole["user"] = 0] = "user";
    UserRole[UserRole["admin"] = 1] = "admin";
    UserRole[UserRole["superAdmin"] = 2] = "superAdmin";
})(UserRole || (UserRole = {}));
const employeeSchema = new mongoose_1.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true,
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
    contactNo: {
        type: Number,
        required: true,
    },
    designation: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
        required: true,
    },
    department: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    dateOfJoining: {
        type: Date,
        required: true,
    },
    reportingTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null,
    },
    userRole: {
        type: String,
        enum: UserRole,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});
exports.default = (0, mongoose_1.model)("Employee", employeeSchema);
//# sourceMappingURL=employee.model.js.map