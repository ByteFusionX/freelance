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
export class CreateEmployeeDialog implements OnInit {
  departments: getDepartment[] = [];
  employees: getEmployee[] = [];
  selectedEmployee!: number;
  showPassword: boolean = false;
  passwordType: string = this.showPassword ? 'text' : 'password';
  showIcon: string = this.showPassword ? 'heroEye' : 'heroEyeSlash';

  employeeForm = this._fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    designation: ['', Validators.required],
    dob: ['', Validators.required],
    department: ['', Validators.required],
    contactNo: ['', Validators.required],
    category: ['', Validators.required],
    dateOfJoining: ['', Validators.required],
    reportingTo: [''],
    userRole: ['', Validators.required],
    password: ['',[Validators.required,Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,}$/)]]
  })

  constructor(
    public dialogRef: MatDialogRef<CreateEmployeeDialog>,
    private _fb: FormBuilder,
    private _profileService: ProfileService,
    private _employeeService: EmployeeService
  ) { }

  ngOnInit() {
    this.getDepartment()
    this.getEmployee()
  }

  getDepartment() {
    this._profileService.getDepartments().subscribe((res: getDepartment[]) => {
      this.departments = res;
    })
  }

  getEmployee() {
    this._employeeService.getEmployees().subscribe((res: getEmployee[]) => {
      this.employees = res;
    })
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      const selectedReportingTo = this.employeeForm.get('reportingTo')?.value;

      const reportingToValue = selectedReportingTo === '' ? null : selectedReportingTo;

      const employeeData: getEmployee = this.employeeForm.value as getEmployee;

      employeeData.reportingTo = reportingToValue;

      this._employeeService.createEmployees(employeeData).subscribe((data) => {
        this.dialogRef.close(data)
      })
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  passwordShow() {
    this.showPassword = !this.showPassword
    this.passwordType = this.showPassword ? 'text' : 'password';
    this.showIcon = this.showPassword ? 'heroEye' : 'heroEyeSlash';
  }

  generateRandomPassword(): string {
    this.showPassword = true;
    this.passwordType = this.showPassword ? 'text' : 'password';
    this.showIcon = this.showPassword ? 'heroEye' : 'heroEyeSlash';

    const capitalLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const smallLetters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+{}[]';

    const allChars = capitalLetters + smallLetters + numbers + specialChars;

    let password = '';

    password += capitalLetters[Math.floor(Math.random() * capitalLetters.length)];
    password += smallLetters[Math.floor(Math.random() * smallLetters.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    for (let i = 4; i < 8; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    const shuffledPassword: string | null = password.split('').sort(() => 0.5 - Math.random()).join('');
    this.employeeForm.patchValue({ password: shuffledPassword })
    return shuffledPassword;
  }


}
