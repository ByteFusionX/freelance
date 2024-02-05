import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from 'src/app/core/services/customer/customer.service';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { ToastrService } from 'ngx-toastr';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { customerForm, getCustomer } from 'src/app/shared/interfaces/customer.interface';

@Component({
  selector: 'app-customer-edit',
  templateUrl: './customer-edit.component.html',
  styleUrls: ['./customer-edit.component.css']
})
export class CustomerEditComponent {
  departments: getDepartment[] = [];
  customerForm!: FormGroup;
  isSubmitted: boolean = false;
  customerData!: customerForm



  constructor(private _fb: FormBuilder,
    private _profileService: ProfileService,
    private _customerService: CustomerService,
    private _employeeService: EmployeeService,
    private _router: Router,
    private toastr: ToastrService) {
    this.getCustomerData()
    this.getDepartment()

  }


  ngOnInit() {
    this.customerForm = this._fb.group({
      department: ['', Validators.required],
      contactDetails: this._fb.array([
        this._fb.group({
          courtesyTitle: ['', Validators.required],
          firstName: ['', Validators.required],
          lastName: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]]
        })
      ]),
      companyName: ['', Validators.required],
      customerEmailId: ['', [Validators.required, Validators.email]],
      contactNo: ['', Validators.required],
      createdBy: ['', Validators.required]
    });
    if (this.customerData && this.departments) {
      for (let i = 1; i < this.customerData.contactDetails.length; i++) {
        this.addContactFormGroup()
      }
      this.customerForm.patchValue(this.customerData)

      this.customerForm.get('department')?.patchValue(this.customerData.department._id)

    }
  }

  getCustomerData() {
    const navigation = this._router.getCurrentNavigation();
    if (navigation) {
      this.customerData = navigation.extras.state as customerForm
      console.log(this.customerData)
    } else {
      this._router.navigate(['/customers']);
    }
  }

  getDepartment() {
    this._profileService.getDepartments().subscribe((res: getDepartment[]) => {
      this.departments = res;
      console.log(this.departments)
    })
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
    let userId = this._employeeService.employeeToken().id;
    this.customerForm.patchValue({ createdBy: userId })
    if (this.customerForm.valid) {

      const customer = this.customerForm.value
      customer.id = this.customerData._id

      this._customerService.editCustomer(customer).subscribe((res: getCustomer) => {
        this._router.navigate(['/customers'])
        console.log(res)
      })
    } else {
      this.toastr.warning('Check the fields properly!', 'Warning !')
    }
  }

  addContactFormGroup() {
    this.contactDetails.push(this._fb.group({
      courtesyTitle: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
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
