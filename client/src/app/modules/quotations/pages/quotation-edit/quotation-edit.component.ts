import { DatePipe } from '@angular/common';
import {  Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectConfig } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { CustomerService } from 'src/app/core/services/customer/customer.service';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { ContactDetail, getCustomer } from 'src/app/shared/interfaces/customer.interface';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { quotatation, quotatationForm } from 'src/app/shared/interfaces/quotation.interface';

@Component({
  selector: 'app-quotation-edit',
  templateUrl: './quotation-edit.component.html',
  styleUrls: ['./quotation-edit.component.css']
})
export class QuotationEditComponent {
  quoteData!: quotatationForm;
  quoteForm!: FormGroup;
  departments: getDepartment[] = [];
  customers: getCustomer[] = [];
  contacts: ContactDetail[] = []
  tokenData!: { id: string, employeeId: string };
  submit: boolean = false

  constructor(
    private config: NgSelectConfig,
    private _router: Router,
    private _fb: FormBuilder,
    private _customerService: CustomerService,
    private _profileService: ProfileService,
    private _quoteService: QuotationService,
    private _employeeService: EmployeeService,
    private _datePipe: DatePipe,
    private toastr: ToastrService
  ) {
    this.getQuoteData();    
  }

  ngOnInit() {
    this.config.notFoundText = 'Custom not found';
    this.config.appendTo = 'body';
    this.config.bindValue = 'value';

    this.getCustomers();
    this.getDepartment();
    this.tokenData = this._employeeService.employeeToken();

    this.quoteForm = this._fb.group({
      client: [undefined, Validators.required],
      attention: [undefined, Validators.required],
      date: ['', Validators.required],
      department: [undefined, Validators.required],
      subject: ['', Validators.required],
      currency: [undefined, Validators.required],
      items: this._fb.array([
        this._fb.group({
          detail: ['', Validators.required],
          quantity: ['', Validators.required],
          unitCost: ['', Validators.required],
          profit: ['', Validators.required],
          availability: ['', Validators.required],
        })
      ]),
      totalDiscount:['',Validators.required],
      customerNote: ['', Validators.required],
      termsAndCondition: ['', Validators.required],
      createdBy:['']
    })

    if(this.quoteData){
      this.quoteData.date = this._datePipe.transform(this.quoteData.date, 'yyyy-MM-dd');
      this.quoteForm.controls['client'].setValue(this.quoteData.client);
      this.quoteForm.patchValue(this.quoteData)
    }
  }

  getQuoteData(){
    const navigation = this._router.getCurrentNavigation();
    console.log(navigation)
    if (navigation) {
      this.quoteData = navigation.extras.state as quotatationForm
    } else {
      this._router.navigate(['/quotations']);
    }
  }
  
  get itemDetails(): FormArray {
    return this.quoteForm.get('items') as FormArray;
  }

  addItemFormGroup() {
    console.log(this.itemDetails)
    this.itemDetails.push(this._fb.group({
      detail: ['', Validators.required],
      quantity: ['', Validators.required],
      unitCost: ['', Validators.required],
      profit: ['', Validators.required],
      availability: ['', Validators.required],
    }));
  }


  getCustomers() {
    this._customerService.getCustomers().subscribe((res) => {
      this.customers = res;
      if(this.quoteData){
        this.onCustomerChange(this.quoteData.client)
      }
    })
  }

  get f() {
    return this.quoteForm.controls;
  }

  getDepartment() {
    this._profileService.getDepartments().subscribe((res: getDepartment[]) => {
      this.departments = res;
    })
  }

  onCustomerChange(event: string | getCustomer) {
    const customer: getCustomer | undefined = this.customers.find((value) => value._id == event)
    if (customer) {
      this.contacts = customer?.contactDetails;
    }
  }

  createCustomer() {
    console.log("asdffffff");
  }

  onRemoveItem(index: number): void {
    this.itemDetails.removeAt(index);
  }

  calculateTotalCost(i: number) {
    return this.itemDetails.controls[i].get('quantity')?.value * this.itemDetails.controls[i].get('unitCost')?.value
  }

  calculateUnitPrice(i: number) {
    const decimalMargin = this.itemDetails.controls[i].get('profit')?.value / 100;
    return this.itemDetails.controls[i].get('unitCost')?.value / (1 - decimalMargin)
  }

  calculateTotalPrice(i: number) {
    return this.calculateUnitPrice(i) * this.itemDetails.controls[i].get('quantity')?.value
  }

  calculateAllTotalCost(){
    let totalCost = 0;
    this.itemDetails.controls.forEach((item,i)=>{
      totalCost += this.calculateTotalCost(i)
    })
    return totalCost;
  }

  calculateSellingPrice():number{
    let totalCost = 0;
    this.itemDetails.controls.forEach((item,i)=>{
      totalCost += this.calculateTotalPrice(i)
    })
    return totalCost;
  } 

  calculateTotalProfit():number{
    return ((this.calculateSellingPrice()-this.calculateAllTotalCost())/this.calculateSellingPrice() * 100) || 0
  }

  calculateDiscoutPrice():number{
    return this.calculateSellingPrice() - this.quoteForm.get('totalDiscount')?.value;
  }


  onQuoteSaveSubmit() {
    this.submit = true
    if(this.quoteForm.valid){
      this._quoteService.updateQuotation(this.quoteForm.value,this.quoteData._id).subscribe((res:quotatation)=>{
        this._router.navigate(['/quotations'])
      })
    }else {
      this.toastr.warning('Check the fields properly!', 'Warning !')
    }

  }
}
