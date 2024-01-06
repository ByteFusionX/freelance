import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeDialog  implements OnInit{
  departments:getDepartment[] = [];
  employees:getEmployee[] = [];
  selectedEmployee!: number;

  employeeForm = this._fb.group({
    employeeId: ['', Validators.required],
    userName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    designation: ['', Validators.required],
    dob: ['', Validators.required],
    department: ['', Validators.required],
    contactNo:['',Validators.required],
    category: ['', Validators.required],
    dateOfJoining: ['', Validators.required],
    reportingTo: [''],
    userRole: ['', Validators.required],
  })



  constructor(
    public dialogRef: MatDialogRef<CreateEmployeeDialog>,
    private _fb: FormBuilder,
    private _profileService:ProfileService,
    private _employeeService:EmployeeService
  ) { }

  ngOnInit(){
    this.getDepartment()
    this.getEmployee()
  }

  getDepartment(){
    this._profileService.getDepartments().subscribe((res:getDepartment[])=>{
      this.departments = res;
    })
  }

  getEmployee(){
    this._employeeService.getEmployees().subscribe((res:getEmployee[])=>{
      this.employees = res;
    }) 
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      const selectedReportingTo = this.employeeForm.get('reportingTo')?.value;

      const reportingToValue = selectedReportingTo === '' ? null : selectedReportingTo;   

      const employeeData:getEmployee = this.employeeForm.value as getEmployee; 

      employeeData.reportingTo = reportingToValue;

      this._employeeService.createEmployees(employeeData).subscribe((data)=>{
        this.dialogRef.close(data)
      })
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
