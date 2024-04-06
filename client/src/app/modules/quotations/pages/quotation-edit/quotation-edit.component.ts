import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControlOptions, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgSelectConfig } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { Observable, first } from 'rxjs';
import { CustomerService } from 'src/app/core/services/customer/customer.service';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { customerNotes, termsAndConditions } from 'src/app/shared/constants/constant';
import { ContactDetail, getCustomer } from 'src/app/shared/interfaces/customer.interface';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { Quotatation, getQuotatation, quotatationForm } from 'src/app/shared/interfaces/quotation.interface';
import { QuotationPreviewComponent } from '../quotation-preview/quotation-preview.component';

@Component({
  selector: 'app-quotation-edit',
  templateUrl: './quotation-edit.component.html',
  styleUrls: ['./quotation-edit.component.css']
})
export class QuotationEditComponent {
  customers$!: Observable<getCustomer[]>;

  quoteData!: quotatationForm;
  quoteForm!: FormGroup;
  departments: getDepartment[] = [];
  contacts: ContactDetail[] = []
  tokenData!: { id: string, employeeId: string };
  customerNotes: string[] = customerNotes;
  termsAndConditions: string[] = termsAndConditions;

  submit: boolean = false;
  isSaving: boolean = false;
  isDownloading: boolean = false;
  isPreviewing: boolean = false;

  @ViewChild('inputTextArea') inputTextArea!: ElementRef;

  constructor(
    private config: NgSelectConfig,
    private _router: Router,
    private _fb: FormBuilder,
    private _customerService: CustomerService,
    private _profileService: ProfileService,
    private _quoteService: QuotationService,
    private _dialog: MatDialog,
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

    this.getAllCustomers();
    this.getDepartment();
    this.tokenData = this._employeeService.employeeToken();

    this.quoteForm = this._fb.group({
      client: [null, Validators.required],
      attention: [null, Validators.required],
      date: ['', Validators.required],
      department: [null, Validators.required],
      subject: ['', Validators.required],
      currency: [null, Validators.required],
      items: this._fb.array([
        this._fb.group({
          itemName: ['', Validators.required],
          itemDetails: this._fb.array([
            this._fb.group({
              detail: ['', Validators.required],
              quantity: ['', Validators.required],
              unitCost: ['', Validators.required],
              profit: ['', Validators.required],
              availability: ['', Validators.required],
            }),
          ])
        })
      ]),
      totalDiscount: ['', Validators.required],
      customerNote: this._fb.group({
        defaultNote: [null],
        text: [''],
      }, { validator: this.customerNoteValidator } as AbstractControlOptions),
      termsAndCondition: this._fb.group({
        defaultNote: [null],
        text: [''],
      }, { validator: this.customerNoteValidator } as AbstractControlOptions),
      createdBy: ['']
    });

    if (this.quoteData) {
      this.quoteData.date = this._datePipe.transform(this.quoteData.date, 'yyyy-MM-dd');
      this.quoteForm.controls['client'].setValue(this.quoteData.client);
      this.quoteForm.patchValue(this.quoteData);
      console.log(this.quoteForm.value)
    }
  }

  customerNoteValidator(formGroup: FormGroup) {
    const defaultNote = formGroup.get('defaultNote')?.value;
    const text = formGroup.get('text')?.value;

    return (defaultNote || text) ? null : { required: true };
  }

  getQuoteData() {
    const navigation = this._router.getCurrentNavigation();
    console.log(navigation)
    if (navigation) {
      this.quoteData = navigation.extras.state as quotatationForm
      this.quoteData.client = (this.quoteData.client as getCustomer)._id
      this.quoteData.attention = (this.quoteData.attention as ContactDetail)._id
      this.quoteData.department = (this.quoteData.department as getDepartment)._id
      this.quoteData.createdBy = (this.quoteData.createdBy as getEmployee)._id
    } else {
      this._router.navigate(['/quotations']);
    }
  }

  get items(): FormArray {
    return this.quoteForm.get('items') as FormArray;
  }

  getItemDetailsControls(index: number): FormArray {
    return this.items.at(index).get('itemDetails') as FormArray;
  }

  addItemFormGroup() {
    this.items.push(this._fb.group({
      itemName: ['', Validators.required],
      itemDetails: this._fb.array([
        this._fb.group({
          detail: ['', Validators.required],
          quantity: ['', Validators.required],
          unitCost: ['', Validators.required],
          profit: ['', Validators.required],
          availability: ['', Validators.required],
        })
      ])
    }));
  }

  createItemDetail(): FormGroup {
    return this._fb.group({
      detail: ['', Validators.required],
      quantity: ['', Validators.required],
      unitCost: ['', Validators.required],
      profit: ['', Validators.required],
      availability: ['', Validators.required]
    });
  }

  addItemDetail(index: number): void {
    this.getItemDetailsControls(index).push(this.createItemDetail());
  }


  getAllCustomers() {
    this.customers$ = this._customerService.getAllCustomers();
    if (this.quoteData) {
      this.onCustomerChange(this.quoteData.client)
    }
  }

  get f() {
    return this.quoteForm.controls;
  }

  getDepartment() {
    this._profileService.getDepartments().subscribe((res: getDepartment[]) => {
      this.departments = res;
    })
  }

  async onCustomerChange(event: string | getCustomer) {
    const customers = await this.customers$.pipe(first()).toPromise() as getCustomer[];
    const customer: getCustomer | undefined = customers.find((value) => value._id == event)
    if (customer) {
      this.contacts = customer?.contactDetails;
    }
  }

  createCustomer() {
    console.log("asdffffff");
  }

  onRemoveItem(index: number): void {
    this.items.removeAt(index);
  }

  onRemoveItemDetail(i: number, j: number) {
    this.getItemDetailsControls(i).removeAt(j);
  }

  calculateTotalCost(i: number, j: number) {
    console.log(this.getItemDetailsControls(i).value.length)
    return this.getItemDetailsControls(i).controls[j].get('quantity')?.value * this.getItemDetailsControls(i).controls[j].get('unitCost')?.value
  }

  calculateUnitPrice(i: number, j: number) {
    const decimalMargin = this.getItemDetailsControls(i).controls[j].get('profit')?.value / 100;
    return this.getItemDetailsControls(i).controls[j].get('unitCost')?.value / (1 - decimalMargin)
  }

  calculateTotalPrice(i: number, j: number) {
    return this.calculateUnitPrice(i, j) * this.getItemDetailsControls(i).controls[j].get('quantity')?.value
  }

  calculateAllTotalCost() {
    let totalCost = 0;
    this.items.value.forEach((item: any, i: number) => {
      this.getItemDetailsControls(i).value.forEach((item: any, j: number) => {
        totalCost += this.calculateTotalCost(i, j)
      })
    })

    return totalCost;
  }

  calculateSellingPrice(): number {
    let totalCost = 0;
    this.items.value.forEach((item: any, i: number) => {
      this.getItemDetailsControls(i).value.forEach((item: any, j: number) => {
        totalCost += this.calculateTotalPrice(i, j)
      })
    })
    return totalCost;
  }

  calculateTotalProfit(): number {
    return ((this.calculateSellingPrice() - this.calculateAllTotalCost()) / this.calculateSellingPrice() * 100) || 0
  }

  calculateDiscoutPrice(): number {
    return this.calculateSellingPrice() - this.quoteForm.get('totalDiscount')?.value;
  }

  async onDownloadPdf() {
    this.submit = true;

    if (this.quoteForm.valid) {
      this.isDownloading = true;
      let quoteData: quotatationForm = this.quoteForm.value;

      const customers = await this.customers$.pipe(first()).toPromise() as getCustomer[];
      const customer = customers.find(c => c._id === quoteData.client);
      if (customer) {
        quoteData.client = customer;
      }

      const contact = this.contacts.find(c => c._id === quoteData.attention);
      if (contact) {
        quoteData.attention = contact;
      }

      this._employeeService.employeeData$.subscribe((employee) => {
        quoteData.createdBy = employee
      })

      quoteData.quoteId = this.quoteData.quoteId;

      const finalQuoteData: getQuotatation = quoteData as getQuotatation;

      const pdfDoc = this._quoteService.generatePDF(finalQuoteData)
      pdfDoc.then((pdf) => {
        pdf.download(quoteData.quoteId as string)
        this.isDownloading = false;
      })
    } else {
      this.toastr.warning('Check the fields properly!', 'Warning !')
    }
  }


  async onPreviewPdf() {
    this.submit = true;

    if (this.quoteForm.valid) {
      this.isPreviewing = true;

      try {
        const quoteData: quotatationForm = this.quoteForm.value;

        const customers = await this.customers$.pipe(first()).toPromise() as getCustomer[];
        const customer = customers.find(c => c._id === quoteData.client);
        if (customer) {
          quoteData.client = customer;
        }

        const contact = this.contacts.find(c => c._id === quoteData.attention);
        if (contact) {
          quoteData.attention = contact;
        }

        this._employeeService.employeeData$.subscribe((employee) => {
          quoteData.createdBy = employee
        })

        quoteData.quoteId = this.quoteData.quoteId;

        const finalQuoteData: getQuotatation = quoteData as getQuotatation;

        const pdfDoc = await this._quoteService.generatePDF(finalQuoteData);
        pdfDoc.getBlob((blob: Blob) => {
          let url = window.URL.createObjectURL(blob);
          this.isPreviewing = false;
          this._dialog.open(QuotationPreviewComponent, { data: url });
        });

      } catch (error) {
        console.error('Error generating PDF:', error);
        this.toastr.error('Error generating PDF. Please try again.', 'Error');
      }
    } else {
      this.toastr.warning('Check the fields properly!', 'Warning !');
    }
  }

  onQuoteSaveSubmit() {
    this.submit = true
    if (this.quoteForm.valid) {
      this.isSaving = true;
      this._quoteService.updateQuotation(this.quoteForm.value, this.quoteData._id).subscribe((res: Quotatation) => {
        this._router.navigate(['/quotations'])
      })
    } else {
      this.isSaving = false;
      this.toastr.warning('Check the fields properly!', 'Warning !')
    }

  }


  applyFormatting(index: number, textarea: HTMLTextAreaElement): void {
    const control = this.quoteForm.get(`items.${index}.detail`) as FormControl;
    let currentValue = control.value;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    const selectedText = currentValue.substring(selectionStart, selectionEnd);
    const escapedText = selectedText.replace(/\\/g, '\\\\'); 
    let formattedText = `**${escapedText}**`;

    formattedText = formattedText.replace(/\n/g, ' ');

 
    const newText = currentValue.substring(0, selectionStart) + formattedText + currentValue.substring(selectionEnd);

  
    control.setValue(newText);
}

  
}
