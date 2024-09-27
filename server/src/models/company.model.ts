import { Schema, Document, model, Types } from "mongoose";

interface Company extends Document {
  name: String;
  description: String;
  address: Address;
  salesTarget: SalesTarget;
  grossProfitTarget: SalesTarget;
}

interface SalesTarget {
  targetValue: number;
  badRange: number;
  moderateRange: number;
}

interface Address {
  street: String;
  area: String;
  city: String;
  country: String;
}

const addressSchema = new Schema<Address>({
  street: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

const companySchema = new Schema<Company>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  address: {
    type: addressSchema,
    required: true,
  },
  salesTarget: {
    type: Object
  },
  grossProfitTarget: {
    type: Object
  },
});


export default model<Company>("Company", companySchema);
