import { Schema, Document, model, Types } from "mongoose";

interface ContactDetail {
  _id: string;
  courtesyTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: number;
  department: Types.ObjectId;
}

export interface Customer extends Document {
  clientRef: string;
  department: Types.ObjectId;
  contactDetails: ContactDetail[];
  companyName: string;
  customerType: string;
  companyAddress: string;
  customerEmailId: string;
  contactNo: number;
  createdBy: Types.ObjectId; // Denotes the current owner
  sharedWith: Types.ObjectId[]; // Array of employees with shared access
  createdDate: Date;
}

const contactDetailSchema = new Schema({
  courtesyTitle: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNo: { type: Number, required: true },
  department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
});

const customerSchema = new Schema<Customer>({
  clientRef: { type: String, required: true, unique: true },
  department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
  contactDetails: [{ type: contactDetailSchema, required: true }],
  companyName: { type: String, required: true },
  customerType: { type: String, required: true },
  companyAddress: { type: String, required: true },
  customerEmailId: { type: String, required: true },
  contactNo: { type: Number, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "Employee", required: true }, // Current owner
  sharedWith: [{ type: Schema.Types.ObjectId, ref: "Employee" }], // Employees with shared access
  createdDate: { type: Date, default: Date.now },
});

export default model<Customer>("Customer", customerSchema);
