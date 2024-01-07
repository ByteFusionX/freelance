import { Schema, Document, model, Types } from "mongoose";

interface ContactDetail {
  courtesyTitle: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Customer extends Document {
  department: Types.ObjectId;
  contactDetails: ContactDetail[];
  companyName: string;
  customerEmailId: string;
  contactNo: number;
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
});

export default model<Customer>("Customer", customerSchema);