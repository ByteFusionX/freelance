import { Schema, Document, model, Types } from "mongoose";

interface Department extends Document {
    departmentName: string;
    departmentHead: Types.ObjectId;
    createdDate: Date;
}

const internalDepartmentSchema = new Schema<Department>({
    departmentName: {
        type: String,
        unique: true,
        required: true,
    },
    departmentHead: {
        type: Schema.Types.ObjectId, 
        ref: 'Employee'
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});

export default model<Department>("InternalDepartment", internalDepartmentSchema);
