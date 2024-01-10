export interface getEmployee {
    _id?:string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    designation: string;
    dob: string;
    department: string;
    contactNo:number | string;
    category: string;
    dateOfJoining: string;
    reportingTo: string | null | undefined;
    userRole: string;
}