import { ChangeDetectionStrategy, Component, QueryList, ViewChildren } from '@angular/core';
import { AbstractControlOptions, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgSelectComponent, NgSelectConfig } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription, first } from 'rxjs';
import { CustomerService } from 'src/app/core/services/customer/customer.service';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { customerNotes, termsAndConditions } from 'src/app/shared/constants/constant';
import { ContactDetail, getCustomer } from 'src/app/shared/interfaces/customer.interface';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { getEnquiry } from 'src/app/shared/interfaces/enquiry.interface';
import { Quotatation, getQuotatation, quotatationForm } from 'src/app/shared/interfaces/quotation.interface';
import { customerNoteValidator } from 'src/app/shared/validators/quoation.validator';
import { QuotationPreviewComponent } from '../quotation-preview/quotation-preview.component';

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
  selectedCutomerNote: string | null = null
  selectedtermsAndCondition: string | null = null

  quoteForm!: FormGroup;
  departments: getDepartment[] = [];
  customerNotes: string[] = customerNotes;
  termsAndConditions: string[] = termsAndConditions;
  contacts: ContactDetail[] = []
  tokenData!: { id: string, employeeId: string };

  isEdit: boolean = false;
  isSaving: boolean = false;
  submit: boolean = false;
  isDownloading: boolean = false;
  isPreviewing: boolean = false;

  private subscriptions = new Subscription();

  constructor(
    private config: NgSelectConfig,
    private _fb: FormBuilder,
    private _customerService: CustomerService,
    private _profileService: ProfileService,
    private _quoteService: QuotationService,
    private _dialog: MatDialog,
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
      createdBy: [''],
      enqId: ['']
    });

    this.quoteForm.patchValue({ totalDiscount: '0', createdBy: this.tokenData.id })
    this.enquiryData$ = this._enquiryService.enquiryData$;
    this.subscriptions.add(
      this.enquiryData$.subscribe((data) => {
        this.quoteForm.patchValue({ client: data?.client._id, department: data?.department._id, enqId: data?._id })
        this.onChange(data?.client._id as string);
        this.quoteForm.patchValue({ attention: data?.contact._id })
      })
    )
  }

  customerNoteValidator(formGroup: FormGroup) {
    const defaultNote = formGroup.get('defaultNote')?.value;
    const text = formGroup.get('text')?.value;

    return (defaultNote || text) ? null : { required: true };
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
    console.log(this.quoteForm.value)
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


  onQuoteSubmit() {
    this.submit = true;
    if (this.quoteForm.valid) {
      this.isSaving = true;
      const quoteFormValue = this.quoteForm.value;
      this._quoteService.saveQuotation(quoteFormValue).subscribe((res: Quotatation) => {
        this._router.navigate(['/quotations']);
      })
    } else {
      this.isSaving = false;
      this.toastr.warning('Check the fields properly!', 'Warning !')
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe()
    this._enquiryService.quoteSubject.next(undefined)
  }

  onEnquiryEdit() {
    this.isEdit = true;
    console.log(this.quoteForm.value)
  }
}
