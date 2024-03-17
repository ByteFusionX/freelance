import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectConfig } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { CustomerService } from 'src/app/core/services/customer/customer.service';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { ContactDetail, getCustomer } from 'src/app/shared/interfaces/customer.interface';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { Quotatation } from 'src/app/shared/interfaces/quotation.interface';

@Component({
  selector: 'app-create-quotatation',
  templateUrl: './create-quotatation.component.html',
  styleUrls: ['./create-quotatation.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateQuotatationComponent {
  selectedCustomer!: number;
  selectedContact!: number;
  selectedCurrency: string = "QAR";
  quoteForm!: FormGroup;
  departments: getDepartment[] = [];
  customers: getCustomer[] = [];
  contacts: ContactDetail[] = []
  tokenData!: { id: string, employeeId: string };
  isSaving: boolean = false;
  submit: boolean = false
  @ViewChild('inputTextArea') inputTextArea!: ElementRef;


  constructor(
    private config: NgSelectConfig,
    private _fb: FormBuilder,
    private _customerService: CustomerService,
    private _profileService: ProfileService,
    private _quoteService: QuotationService,
    private _employeeService: EmployeeService,
    private _router: Router,
    private toastr: ToastrService
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
  }

  get itemDetails(): FormArray {
    return this.quoteForm.get('items') as FormArray;
  }

  addItemFormGroup() {
    this.itemDetails.push(this._fb.group({
      detail: ['', Validators.required],
      quantity: ['', Validators.required],
      unitCost: ['', Validators.required],
      profit: ['', Validators.required],
      availability: ['', Validators.required],
    }));
  }


  getAllCustomers() {
    this._customerService.getAllCustomers().subscribe((res) => {
      this.customers = res;
    })
  }

  getDepartment() {
    this._profileService.getDepartments().subscribe((res: getDepartment[]) => {
      this.departments = res;
    })
  }

  get f() {
    return this.quoteForm.controls;
  }

  onCustomerChange(event: string) {
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

  applyFormatting(index: number, textarea: HTMLTextAreaElement): void {
    const control = this.quoteForm.get(`items.${index}.detail`) as FormControl;
    const currentValue = control.value;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    // Apply bold formatting to the selected text
    const selectedText = currentValue.substring(selectionStart, selectionEnd);
    const formattedText = `**${selectedText}**`;

    // Replace the selected text with the formatted text
    const newText = currentValue.substring(0, selectionStart) + formattedText + currentValue.substring(selectionEnd);

    // Update the form control value
    control.setValue(newText);

    // Set the HTML content of the textarea to render bold text
    textarea.innerHTML = newText;
}



}
