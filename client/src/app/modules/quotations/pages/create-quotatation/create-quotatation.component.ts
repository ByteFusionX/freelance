import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectConfig } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { CustomerService } from 'src/app/core/services/customer/customer.service';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { ContactDetail, getCustomer } from 'src/app/shared/interfaces/customer.interface';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { getEnquiry } from 'src/app/shared/interfaces/enquiry.interface';
import { Quotatation } from 'src/app/shared/interfaces/quotation.interface';

@Component({
  selector: 'app-create-quotatation',
  templateUrl: './create-quotatation.component.html',
  styleUrls: ['./create-quotatation.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateQuotatationComponent {
  customers$!: Observable<getCustomer[]>;
  enquiryData$!: Observable<getEnquiry | undefined>;
  selectedCustomer!: number;
  selectedContact!: number;
  selectedCurrency: string = "QAR";
  quoteForm!: FormGroup;
  departments: getDepartment[] = [];
  contacts: ContactDetail[] = []
  tokenData!: { id: string, employeeId: string };
  isSaving: boolean = false;
  submit: boolean = false;

  private subscriptions = new Subscription();

  constructor(
    private config: NgSelectConfig,
    private _fb: FormBuilder,
    private _customerService: CustomerService,
    private _profileService: ProfileService,
    private _quoteService: QuotationService,
    private _employeeService: EmployeeService,
    private _router: Router,
    private _enquiryService: EnquiryService,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    this.config.notFoundText = 'Custom not found';
    this.config.appendTo = 'body';
    this.config.bindValue = 'value';


    this.getAllCustomers();
    this.getDepartment();
    this.tokenData = this._employeeService.employeeToken();

    this.quoteForm = this._fb.group({
      client: ['', Validators.required],
      attention: ['', Validators.required],
      date: ['', Validators.required],
      department: ['', Validators.required],
      subject: ['', Validators.required],
      currency: ['', Validators.required],
      items: this._fb.array([
        this._fb.group({
          detail: ['', Validators.required],
          quantity: ['', Validators.required],
          unitCost: ['', Validators.required],
          profit: ['', Validators.required],
          availability: ['', Validators.required],
        })
      ]),
      totalDiscount: ['', Validators.required],
      customerNote: ['', Validators.required],
      termsAndCondition: ['', Validators.required],
      createdBy: ['']
    })
    this.quoteForm.patchValue({ totalDiscount: '0', createdBy: this.tokenData.id })
    this.enquiryData$ = this._enquiryService.enquiryData$;
    console.log(this.enquiryData$)
    //   this._enquiryService.enquiryData$.subscribe(data => {

    //   this.quoteForm.patchValue({client:data?.client._id})
    //   this.onChange(data?.client._id as string)
    // }))

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


  getAllCustomers() {
    this.customers$ = this._customerService.getAllCustomers()
  }

  getDepartment() {
    this._profileService.getDepartments().subscribe((res: getDepartment[]) => {
      this.departments = res;
    })
  }

  get f() {
    return this.quoteForm.controls;
  }

  onChange(change: string) {
    if (change && this.customers$) {
      this.subscriptions.add(this.customers$.subscribe((data) => {
        let customer = data.find((contact) => contact._id == change)
        if (customer) {
          this.contacts = customer.contactDetails
        }
      }))
    } else {
      this.contacts = []
      this.quoteForm.controls['attention'].setValue(undefined)
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

  calculateAllTotalCost() {
    let totalCost = 0;
    this.itemDetails.controls.forEach((item, i) => {
      totalCost += this.calculateTotalCost(i)
    })
    return totalCost;
  }

  calculateSellingPrice(): number {
    let totalCost = 0;
    this.itemDetails.controls.forEach((item, i) => {
      totalCost += this.calculateTotalPrice(i)
    })
    return totalCost;
  }

  calculateTotalProfit(): number {
    return ((this.calculateSellingPrice() - this.calculateAllTotalCost()) / this.calculateSellingPrice() * 100) || 0
  }

  calculateDiscoutPrice(): number {
    return this.calculateSellingPrice() - this.quoteForm.get('totalDiscount')?.value;
  }


  onQuoteSubmit() {
    this.submit = true
    if (this.quoteForm.valid) {
      this.isSaving = true;
      this._quoteService.saveQuotation(this.quoteForm.value).subscribe((res: Quotatation) => {
        this.isSaving = false;
        this._router.navigate(['/quotations']);
      })
    } else {
      this.toastr.warning('Check the fields properly!', 'Warning !')
    }

  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe()
    this._enquiryService.quoteSubject.next(undefined)
  }
}
