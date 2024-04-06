import { Schema, Document, model, Types } from "mongoose";

interface Employee extends Document {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    contactNo: number;
    designation: string;
    dob: Date;
    department: Types.ObjectId;
    category: Types.ObjectId;
    dateOfJoining: Date;
    reportingTo: Types.ObjectId;
    userRole: string;
    password: string;
    createdBy: Types.ObjectId;
}

enum UserRole {
    user,
    admin,
    superAdmin
}

const employeeSchema = new Schema<Employee>({
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
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    dateOfJoining: {
        type: Date,
        required: true,
    },
    reportingTo: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        default: null,
    },
    password: {
        type: String,
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required:true
    }
});

employeeSchema.index({ firstName: 1, lastName: 1 })
export default model<Employee>("Employee", employeeSchema);
