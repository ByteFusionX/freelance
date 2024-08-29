import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from 'src/app/core/services/customer/customer.service';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { ToastrService } from 'ngx-toastr';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { getCustomer } from 'src/app/shared/interfaces/customer.interface';
import { MatDialog } from '@angular/material/dialog';
import { CreateDepartmentDialog } from 'src/app/modules/settings/pages/create-department/create-department.component';

@Component({
  selector: 'app-customer-edit',
  templateUrl: './customer-edit.component.html',
  styleUrls: ['./customer-edit.component.css']
})
export class CustomerEditComponent {
  departments: getDepartment[] = [];
  customerDepartments: getDepartment[] = [];
  customerForm!: FormGroup;
  isSubmitted: boolean = false;
  customerData!: getCustomer;
  initalLength: number = 0;
  isSaving: boolean = false;

  constructor(
    private _fb: FormBuilder,
    private _profileService: ProfileService,
    private _customerService: CustomerService,
    private _employeeService: EmployeeService,
    private _router: Router,
    private toastr: ToastrService,
    public dialog: MatDialog,
  ) {
    this.getCustomerData();
    this.getDepartment();
    this.getCustomerDepartment();
  }


  ngOnInit() {
    this.customerForm = this._fb.group({
      department: ['', Validators.required],
      contactDetails: this._fb.array([
        this._fb.group({
          courtesyTitle: ['', Validators.required],
          firstName: ['', Validators.required],
          lastName: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]],
          phoneNo: ['', [Validators.required]],
          department:['', [Validators.required]]
        })
      ]),
      companyName: ['', Validators.required],
      companyAddress: ['', Validators.required],
      customerEmailId: ['', [Validators.required, Validators.email]],
      contactNo: ['', Validators.required],
      createdBy: ['', Validators.required]
    });

    if (this.customerData && this.departments) {
      const { contactDetails, department } = this.customerData;
    
      contactDetails.slice(1).forEach(() => this.addContactFormGroup());
    
      this.customerForm.patchValue(this.customerData);
      this.customerForm.get('department')?.patchValue(department._id);
    
      contactDetails.forEach((contactDetail, index) => {
        this.contactDetails.at(index).patchValue({ department: contactDetail.department._id });
      });
    
      this.initalLength = contactDetails.length - 1;
    }
    
  }

  getCustomerData() {
    const navigation = this._router.getCurrentNavigation();
    if (navigation) {
      this.customerData = navigation.extras.state as getCustomer
    } else {
      this._router.navigate(['/customers']);
    }
  }

  getDepartment() {
    this._profileService.getDepartments().subscribe((res: getDepartment[]) => {
      this.departments = res;
    })
  }

  getCustomerDepartment() {
    this._profileService.getCustomerDepartments().subscribe((res: getDepartment[]) => {
      this.customerDepartments = res;
    })
  }

  createCustomerDepartment(){
    const dialogRef = this.dialog.open(CreateDepartmentDialog, {
      data: { forCustomer: true }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        data.departmentHead = [data.departmentHead]
        this.customerDepartments = [...this.customerDepartments, data];
      }
    });
  }

  get contactDetails(): FormArray {
    return this.customerForm.get('contactDetails') as FormArray;
  }

  onRemoveContact(index: number): void {
    this.contactDetails.removeAt(index);
  }

  get f() {
    return this.customerForm.controls
  }

  onSubmit(): void {
    this.isSubmitted = true;
    this.isSaving = true;
    let userId = this._employeeService.employeeToken().id;
    this.customerForm.patchValue({ createdBy: userId })
    if (this.customerForm.valid) {

      const customer = this.customerForm.value
      customer.id = this.customerData._id

      this._customerService.editCustomer(customer).subscribe((res: getCustomer) => {
        this.toastr.success('Customer Updated Succesfully');
        this._router.navigate(['/customers'])
      })
    } else {
      this.toastr.warning('Check the fields properly!', 'Warning !');
      this.isSaving = false;
    }
  }

  addContactFormGroup() {
    this.contactDetails.push(this._fb.group({
      courtesyTitle: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNo: ['', [Validators.required]],
      department:['', [Validators.required]]
    }));
  }

  hasContactDetailsErrors(): boolean {
    for (let i = 0; i < this.contactDetails.length; i++) {
      const contactDetailGroup = this.contactDetails.at(i) as FormGroup;

      if (contactDetailGroup && contactDetailGroup.invalid && (contactDetailGroup?.touched || this.isSubmitted)) {

        return true;
      }
    }

    return false;
  }
}
