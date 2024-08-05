import { Department } from "./department.interface";

export interface getEmployee {
  _id?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  dob: string;
  department: string;
  contactNo: number | string;
  category: GetCategory;
  dateOfJoining: string;
  reportingTo: string | null | undefined;
}

export interface getEmployeeDetails {
  _id?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  dob: string;
  department: Department;
  contactNo: number | string;
  category: GetCategory;
  dateOfJoining: string;
  reportingTo: getEmployee;
}

export interface CreateEmployee {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  dob: string;
  department: string;
  contactNo: number | string;
  category: string;
  dateOfJoining: string;
  reportingTo: string | null | undefined;
  createdBy: string | undefined;
}

export interface getCreators {
  _id: string,
  fullName: string
}

export interface getEmployeeObject {
  employeeData: getEmployee
}


export interface FilterEmployee {
  page: number;
  row: number;
  search: string;
}

export interface GetCategory {
  _id?: string;
  categoryName: string;
  role: string;
  privileges: Privileges;
}

export interface getEmployeeByID {
  access: boolean;
  employeeData: getEmployeeDetails
}

export interface Privileges {
  dashboard: {
    viewReport: string;
    totalEnquiry: boolean;
    totalQuote: boolean;
    totalJobs: boolean;
    totalPresale: boolean;
    EnquiryChart: boolean;
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