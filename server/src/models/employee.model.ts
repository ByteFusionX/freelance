import { Schema, Document, model, Types } from "mongoose";

interface Employee extends Document {
    employeeId: string;
    userName: string;
    email: string;
    contactNo:number;
    designation: string;
    dob: Date;
    department: Types.ObjectId;
    category: string;
    dateOfJoining: Date;
    reportingTo: Types.ObjectId;
    userRole: string;
}

enum UserRole{
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
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    contactNo:{
        type:Number,
        required:true,
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
        type: String,
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
    userRole: {
        type: String,
        enum:UserRole,
        required: true,
    },
});

export default model<Employee>("Employee", employeeSchema);