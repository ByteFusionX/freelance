import { Schema, Document, model, Types } from "mongoose";

interface Category extends Document {
    categoryName: string;
    role:string;
    privileges: Privileges;
}

export interface Privileges {
    dashboard: {
      viewReport: string;
    };
    employee: {
      viewReport: string;
      create: boolean;
    };
    announcement: {
      viewReport: string;
      create: boolean;
    };
    customer: {
      viewReport: string;
      create: boolean;
    };
    enquiry: {
      viewReport: string;
      create: boolean;
    };
    assignedJob: {
      viewReport: string;
    };
    quotation: {
      viewReport: string;
      create: boolean;
    };
    jobSheet: {
      viewReport: string;
    };
    portalManagement: {
      department: boolean;
      notesAndTerms: boolean;
    };
  }

enum UserRole {
    user,
    admin,
    superAdmin
}

const categorySchema = new Schema<Category>({
    categoryName: {
        type: String,
        unique: true,
        required: true,
    },
    role: {
        type: String,
        enum: UserRole,
        required: true,
    },
    privileges:{
        type:Object,
        required:true,
    }
});

export default model<Category>("Category", categorySchema);
