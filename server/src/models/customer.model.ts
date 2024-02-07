import { Schema, Document, model, Types } from "mongoose";

interface ContactDetail {
  _id: string;
  courtesyTitle: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Customer extends Document {
  department: Types.ObjectId;
  contactDetails: ContactDetail[];
  companyName: string;
  customerEmailId: string;
  contactNo: number;
  createdBy: Types.ObjectId;
  createdDate: Date;
}

const contactDetailSchema = new Schema({
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

const customerSchema = new Schema<Customer>({
  department: {
    type: Schema.Types.ObjectId,
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
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now
}
});

export default model<Customer>("Customer", customerSchema);