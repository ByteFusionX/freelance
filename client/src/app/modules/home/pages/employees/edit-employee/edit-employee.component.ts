import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { CreateEmployee, GetCategory, getEmployee, getEmployeeDetails } from 'src/app/shared/interfaces/employee.interface';
import { CreateCategoryComponent } from '../create-category/create-category.component';
import { ToastrService } from 'ngx-toastr';
import { CreateEmployeeDialog } from '../create-employee/create-employee.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.css']
})
export class EditEmployeeComponent {

  category$: BehaviorSubject<GetCategory[]> = new BehaviorSubject<GetCategory[]>([]);
  departments$!: Observable<getDepartment[]>;
  userRole: string = 'user';
  canCreateCategory: boolean = false;
  employees$!: Observable<getEmployee[]>;
  isSaving: boolean = false;
  employeeData!: getEmployeeDetails;





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
    password: ['', [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,}$/)]]
  })

  constructor(private _fb:FormBuilder,
              private _router:Router,
              private _profileService:ProfileService,
              private _employeeService:EmployeeService,
              public dialog: MatDialog,
              private _toast: ToastrService,
              public dialogRef: MatDialogRef<CreateEmployeeDialog>,
              @Inject(MAT_DIALOG_DATA) public data: {employeeData:getEmployeeDetails}
            ){
              
  }

  ngOnInit(){
    this.getCategory();
    this.departments$ = this._profileService.getDepartments();
    this.employees$ = this._employeeService.getAllEmployees();
    this.employeeForm.patchValue({
      firstName: this.data.employeeData.firstName,
      lastName: this.data.employeeData.lastName,
      email: this.data.employeeData.email,
      designation: this.data.employeeData.designation,
      dob: this.data.employeeData.dob.substring(0, 10), // Assuming ISO date format
      department: this.data.employeeData.department._id,
      contactNo: this.data.employeeData.contactNo as string,
      category: this.data.employeeData.category.categoryName,
      dateOfJoining: this.data.employeeData.dateOfJoining.substring(0, 10), // Assuming ISO date format
      reportingTo: this.data.employeeData.reportingTo.firstName+' '+this.data.employeeData.reportingTo.lastName
    });
  }

  getCategory() {
    this._employeeService.getCategory().subscribe(data => {
      let categories = data;
      // if (this.userRole == 'admin') {
      //   categories = data.filter((value) => {
      //     return value.role == 'admin' || value.role == 'user';
      //   });
      // }else if(this.userRole == 'user'){
      //   categories = data.filter((value) => {
      //     return value.role == 'user'
      //   })
      // }
      
      this.category$.next(categories);
      console.log(categories)
    });
  }

  createCategory() {
    const dialogRef = this.dialog.open(CreateCategoryComponent, {
      width: '100vh'
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        const currentCategories = this.category$.getValue();
        const updatedCategories = [...currentCategories, data];
        this.category$.next(updatedCategories);

        this._toast.success('Category Created Successfully')
      }
    });
  }

  

  onClose(): void {
    this.dialogRef.close();
  }


  onSubmit(){
    if (this.employeeForm.valid) {
      this.isSaving = true;

      let userId;
      this._employeeService.employeeData$.subscribe((employee) => {
        userId = employee?._id
      })

      const selectedReportingTo = this.employeeForm.get('reportingTo')?.value;
      const reportingToValue = selectedReportingTo === '' ? null : selectedReportingTo;
      const employeeData: CreateEmployee = this.employeeForm.value as CreateEmployee;

      employeeData.createdBy = userId;
      employeeData.reportingTo = reportingToValue;

      // this._employeeService.createEmployees(employeeData).subscribe((data) => {
      //   this.isSaving = false;
      //   this.dialogRef.close(data)
      // })
    }
  }
}
