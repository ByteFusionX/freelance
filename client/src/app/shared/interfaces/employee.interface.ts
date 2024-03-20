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
    _id:string,
    fullName:string
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
    _id?:string;
    categoryName:string;
    role:string;
    privileges:Privileges;
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
  }