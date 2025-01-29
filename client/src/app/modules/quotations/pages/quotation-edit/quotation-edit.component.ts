import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControlOptions, FormArray, FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgSelectConfig } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, first } from 'rxjs';
import { CustomerService } from 'src/app/core/services/customer/customer.service';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { customerNotes, termsAndConditions } from 'src/app/shared/constants/constant';
import { ContactDetail, getCustomer } from 'src/app/shared/interfaces/customer.interface';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { OptionalItems, Quotatation, QuoteItem, getQuotatation, quotatationForm } from 'src/app/shared/interfaces/quotation.interface';
import { fadeInOut } from 'src/app/shared/animations/animations';
import { Note, Notes } from 'src/app/shared/interfaces/notes.interface';
import { QuotationPreviewComponent } from 'src/app/shared/components/quotation-preview/quotation-preview.component';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-quotation-edit',
  templateUrl: './quotation-edit.component.html',
  styleUrls: ['./quotation-edit.component.css'],
  animations: [fadeInOut]
})
export class QuotationEditComponent {
  customers$!: Observable<getCustomer[]>;

  quoteData!: quotatationForm;
  quoteForm!: FormGroup;
  departments: getDepartment[] = [];
  contacts: ContactDetail[] = []
  tokenData!: { id: string, employeeId: string };
  customerNotes!: Note[];
  termsAndConditions!: Note[];

  availabilityDefaultOptions: string[] = [
    "Ex-Stock",
    "Ex-Stock (Subject to Prior Sale)",
    "6-8 Weeks",
    "2-3 Weeks",
    "4-6 Weeks"
  ];
  availabiltyInput$ = new Subject<string>();
  removedItems: any[] = [];
  removedItemDetails: any[] = [];

  submit: boolean = false;
  isSaving: boolean = false;
  isDownloading: boolean = false;
  isPreviewing: boolean = false;
  isTextSelected: boolean = false;

  @ViewChild('inputTextArea') inputTextArea!: ElementRef;

  estimatedOptionalItems!: OptionalItems[];
  calculatedValues: { totalCost: number, sellingPrice: number, totalProfit: number, discount: number } = {
    totalCost: 0,
    sellingPrice: 0,
    totalProfit: 0,
    discount: 0
  }

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
    private toastr: ToastrService,
    private snackBar: MatSnackBar
  ) {
    this.getQuoteData();
    document.addEventListener('selectionchange', () => {
      if (document.activeElement instanceof HTMLTextAreaElement) {
        this.checkTextSelection(document.activeElement);
      } else {
        this.isTextSelected = false;
      }
    });
  }

  ngOnInit() {
    this.config.notFoundText = 'Custom not found';
    this.config.appendTo = 'body';
    this.config.bindValue = 'value';

    this.getAllCustomers();
    this.getDepartment();
    this.getNotes();
    this.tokenData = this._employeeService.employeeToken();

    this.quoteForm = this._fb.group({
      client: [null, Validators.required],
      attention: [null, Validators.required],
      date: ['', Validators.required],
      department: [null, Validators.required],
      subject: ['', Validators.required],
      currency: [null, Validators.required],
      quoteCompany: [null, Validators.required],
      optionalItems: this._fb.array([]),
      customerNote: ['', Validators.required],
      termsAndCondition: ['', Validators.required],
      createdBy: [''],
      closingDate: ['', Validators.required]
    });

    if (this.quoteData) {
      this.quoteData.date = this._datePipe.transform(this.quoteData.date, 'yyyy-MM-dd');
      if (this.quoteData.closingDate) {
        this.quoteData.closingDate = this._datePipe.transform(this.quoteData.closingDate, 'yyyy-MM-dd') as string;
      }
      this.quoteForm.controls['client'].setValue(this.quoteData.client);
      this.quoteForm.patchValue(this.quoteData)
      this.estimatedOptionalItems = this.quoteData.optionalItems;
    }
  }


  getQuoteData() {
    const navigation = this._router.getCurrentNavigation();
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

  get optionalItems() {
    return this.quoteForm.get('optionalItems') as FormArray;
  }

  getAllCustomers() {
    let userId;
    this._employeeService.employeeData$.subscribe((data) => {
      userId = data?._id
    })
    this.customers$ = this._customerService.getAllCustomers(userId);
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

  getNotes() {
    this._profileService.getNotes().subscribe((res: Notes) => {
      this.customerNotes = res.customerNotes
      this.termsAndConditions = res.termsAndConditions
    })
  }

  async onCustomerChange(event: string | getCustomer) {
    const customers = await this.customers$.pipe(first()).toPromise() as getCustomer[];
    const customer: getCustomer | undefined = customers.find((value) => value._id == event)
    if (customer) {
      this.contacts = customer?.contactDetails;
    }
  }

  onCustomerNote(event: Note, noteType: string) {
    if (noteType == 'customerNotes') {
      const customerNote = this.quoteForm.value.customerNote;
      let nextLine = ''
      if (customerNote) {
        nextLine = '\n'
      }
      const note = this.quoteForm.value.customerNote + nextLine + event.note;
      this.quoteForm.patchValue({ customerNote: note })
    } else if (noteType == 'termsAndConditions') {
      const customerNote = this.quoteForm.value.termsAndCondition;
      let nextLine = ''
      if (customerNote) {
        nextLine = '\n'
      }
      const note = this.quoteForm.value.termsAndCondition + nextLine + event.note;
      this.quoteForm.patchValue({ termsAndCondition: note })
    }
  }

  onCalculatedValuesReceived(values: { totalCost: number, sellingPrice: number, totalProfit: number , discount: number }) {
    this.calculatedValues = values;
  }

  calculateDiscountPrice() {
    return (
      this.calculatedValues.sellingPrice -
      (this.calculatedValues.discount || 0)
    );
  }

  async onDownloadPdf(includeStamp: boolean) {
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

      const pdfDoc = this._quoteService.generatePDF(finalQuoteData, includeStamp)
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
console.log(this.quoteForm,this.quoteForm.value)
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

        const finalQuoteData: getQuotatation = quoteData as unknown as getQuotatation;

        const pdfDoc = await this._quoteService.generatePDF(finalQuoteData, true);
        pdfDoc.getBlob((blob: Blob) => {
          let url = window.URL.createObjectURL(blob);
          this.isPreviewing = false;
          this._dialog.open(QuotationPreviewComponent, { data: { url: url, formatedQuote: finalQuoteData } });
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
    this.submit = true;
    console.log(this.quoteForm.value,this.quoteForm)
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

  checkTextSelection(textarea: HTMLTextAreaElement) {
    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    this.isTextSelected = selectedText.length > 0;
  }



}
