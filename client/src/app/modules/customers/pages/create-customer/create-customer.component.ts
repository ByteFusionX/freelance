import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomerService } from 'src/app/core/services/customer/customer.service';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { getCustomer } from 'src/app/shared/interfaces/customer.interface';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';

@Component({
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.css']
})
export class CreateCustomerDialog {
  departments: getDepartment[] = [];
  customerForm!: FormGroup;
  isSubmitted: boolean = false;
  isSaving: boolean = false;

  constructor(
    private _fb: FormBuilder,
    private _profileService: ProfileService,
    private _customerService: CustomerService,
    private _employeeService: EmployeeService,
    private _router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.getDepartment()
    this.customerForm = this._fb.group({
      department: ['', Validators.required],
      contactDetails: this._fb.array([
        this._fb.group({
          courtesyTitle: ['', Validators.required],
          firstName: ['', Validators.required],
          lastName: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]],
          phoneNo: ['', [Validators.required]]
        })
      ]),
      companyName: ['', Validators.required],
      companyAddress: ['', Validators.required],
      customerEmailId: ['', [Validators.required, Validators.email]],
      contactNo: ['', Validators.required],
      createdBy: ['', Validators.required]
    });
  }



  get contactDetails(): FormArray {
    return this.customerForm.get('contactDetails') as FormArray;
  }

  addContactFormGroup() {
    this.contactDetails.push(this._fb.group({
      courtesyTitle: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNo: ['', [Validators.required]]
    }));
  }

  onRemoveContact(index: number): void {
    this.contactDetails.removeAt(index);
  }

  getDepartment() {
    this._profileService.getDepartments().subscribe((res: getDepartment[]) => {
      this.departments = res;
    })
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

  get f() {
    return this.customerForm.controls
  }

  onSubmit(): void {
    this.isSubmitted = true;
    this.isSaving = true;
    let userId = this._employeeService.employeeToken().id;
    this.customerForm.patchValue({ createdBy: userId })
    if (this.customerForm.valid) {
      this._customerService.createCustomer(this.customerForm.value).subscribe((res: getCustomer) => {
        this.toastr.success('Customer added!', 'Success')
        this._router.navigate(['/customers']);
      })
    } else {
      this.toastr.warning('Check the fields properly!', 'Warning !');
      this.isSaving = false;
    }
  }


}
