import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeDialog {

  employeeForm = this.fb.group({
    employeeId: ['', Validators.required],
    userName: ['', Validators.required],
    email: ['', Validators.required],
    designation: ['', Validators.required],
    dob: ['', Validators.required],
    department: ['', Validators.required],
    category: ['', Validators.required],
    dateOfJoining: ['', Validators.required],
    reportingTo: ['', Validators.required],
    userRole: ['', Validators.required],
  })

  constructor(
    public dialogRef: MatDialogRef<CreateEmployeeDialog>,
    private fb: FormBuilder
  ) { }

  onSubmit() {
    if (this.employeeForm.valid) {

    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
