import { Schema, Document, model,Types } from "mongoose";

interface Company extends Document {
    name: String;
    description:String;
    address:Address;
    
}
interface Address {
    street:String;
    area:String;
    city:String;
    country:String;
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
  });
  
  
  export default model<Company>("Company", companySchema);
