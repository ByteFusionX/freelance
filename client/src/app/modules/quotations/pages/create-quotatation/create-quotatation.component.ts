import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControlOptions, FormArray, FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgSelectComponent, NgSelectConfig } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, Subscription, first } from 'rxjs';
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
import { Note, Notes } from 'src/app/shared/interfaces/notes.interface';
import { QuotationPreviewComponent } from 'src/app/shared/components/quotation-preview/quotation-preview.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-create-quotatation',
  templateUrl: './create-quotatation.component.html',
  styleUrls: ['./create-quotatation.component.css'],
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
  customerNotes!: Note[];
  termsAndConditions!: Note[];
  contacts: ContactDetail[] = []
  tokenData!: { id: string, employeeId: string };
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

  isEdit: boolean = false;
  isSaving: boolean = false;
  submit: boolean = false;
  isDownloading: boolean = false;
  isPreviewing: boolean = false;

  @ViewChild('inputTextArea') inputTextArea!: ElementRef;

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
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.config.notFoundText = 'Select a client first..';
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
      items: this._fb.array([
        this._fb.group({
          itemName: ['', Validators.required],
          itemDetails: this._fb.array([
            this._fb.group({
              detail: ['', Validators.required],
              quantity: ['', Validators.required],
              unitCost: ['', Validators.required],
              profit: ['', [Validators.required, this.nonNegativeProfitValidator()]],
              unitPrice: ['', Validators.required],
              availability: ['', Validators.required],
            }),
          ])
        })
      ]),
      totalDiscount: ['', Validators.required],
      customerNote: ['', Validators.required],
      termsAndCondition: ['', Validators.required],
      createdBy: [''],
      enqId: ['']
    });

    this.quoteForm.patchValue({ totalDiscount: '0', createdBy: this.tokenData.id })
    this.enquiryData$ = this._enquiryService.enquiryData$;
    this.subscriptions.add(this.enquiryData$.subscribe((data) => {
      if (data && data?.preSale?.estimations?.items?.length) {
        this.items.clear()
        data.preSale.estimations.items.forEach((item: any, index: number) => {
          this.addItemFormGroup()
          item.itemDetails.forEach((_: any, ind: number) => {
            if (ind > 0) {
              this.addItemDetail(index)
            }
          })
        })
      }
      const items = data?.preSale?.estimations?.items ?? [];
      items.forEach((item: any) => {
        item.itemDetails.forEach((detail: any) => {
          if (!this.availabilityDefaultOptions.includes(detail.availability)) {
            this.availabilityDefaultOptions.push(detail.availability)
          }
        })
      })
      this.quoteForm.patchValue({
        client: data?.client._id,
        department: data?.department._id,
        enqId: data?._id,
        items: items,
        totalDiscount: data?.preSale?.estimations?.totalDiscount ?? 0
      });

      this.onChange(data?.client._id as string);
      this.quoteForm.patchValue({ attention: data?.contact._id, currency: data?.preSale?.estimations?.currency });
    })

    )
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
          unitPrice: [''],
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
      unitPrice: [''],
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

  getNotes() {
    this._profileService.getNotes().subscribe((res: Notes) => {
      this.customerNotes = res.customerNotes
      this.termsAndConditions = res.termsAndConditions
    })
  }

  get f() {
    return this.quoteForm.controls;
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

  onChange(change: string) {
    this.quoteForm.controls['attention'].patchValue(undefined)
    this.contacts = []
    this.config.notFoundText = 'Wait a few Seconds..';
    if (change && this.customers$) {
      this.subscriptions.add(this.customers$.subscribe((data) => {
        let customer = data.find((contact) => contact._id == change)
        if (customer) {
          this.contacts = customer.contactDetails
        }
      }))
    } else {
      this.config.notFoundText = 'Select a client first..';
      this.contacts = []
      this.quoteForm.controls['attention'].setValue(undefined)
    }
  }


  onRemoveItem(index: number): void {
    const removedItem = this.items.at(index).value; 
    this.removedItems.push({ item: removedItem, index }); 
    this.items.removeAt(index);  

    this.showUndoOption('item');
  }

  onRemoveItemDetail(i: number, j: number): void {
    const removedItemDetail = this.getItemDetailsControls(i).at(j).value;
    this.removedItemDetails.push({ item: removedItemDetail, i, j });
    this.getItemDetailsControls(i).removeAt(j);

    this.showUndoOption('item detail');
  }

  undoRemoveItem() {
    if (this.removedItems.length > 0) {
      const { item, index } = this.removedItems.pop();
      this.items.insert(index, this._fb.group({
        itemName: item.itemName,
        itemDetails: this._fb.array(item.itemDetails.map((detail: any) => this._fb.group({
          detail: detail.detail,
          quantity: detail.quantity,
          unitCost: detail.unitCost,
          profit: detail.profit,
          unitPrice: detail.unitPrice,
          availability: detail.availability
        })))
      }));
      this.items.updateValueAndValidity()
    }
  }

  undoRemoveItemDetail() {
    if (this.removedItemDetails.length > 0) {
      const { item, i, j } = this.removedItemDetails.pop();
      this.getItemDetailsControls(i).insert(j, this._fb.group(item));
      this.getItemDetailsControls(i).updateValueAndValidity()
    }
  }

  showUndoOption(type: string) {
    const snackBarRef = this.snackBar.open(`Item removed. Undo?`, 'Undo', { duration: 3000 });

    snackBarRef.onAction().subscribe(() => {
      if (type === 'item') {
        this.undoRemoveItem();
      } else if (type === 'item detail') {
        this.undoRemoveItemDetail();
      }
    });
  }

  calculateTotalCost(i: number, j: number) {
    return this.getItemDetailsControls(i).controls[j].get('quantity')?.value * this.getItemDetailsControls(i).controls[j].get('unitCost')?.value
  }

  calculateUnitPrice(i: number, j: number) {
    const decimalMargin = this.getItemDetailsControls(i).controls[j].get('profit')?.value / 100;
    return this.getItemDetailsControls(i).controls[j].get('unitCost')?.value / (1 - decimalMargin)
  }

  calculateUnitPriceForInput(i: number, j: number) {
    const decimalMargin = this.getItemDetailsControls(i).controls[j].get('profit')?.value / 100;
    const unitPrice = this.getItemDetailsControls(i).controls[j].get('unitCost')?.value / (1 - decimalMargin)
    this.getItemDetailsControls(i).controls[j].get('unitPrice')?.setValue(Number(unitPrice.toFixed(2)))
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

      // Create a deep copy of the form value
      const sanitizedQuoteFormValue = JSON.parse(JSON.stringify(quoteFormValue));

      // Remove unitPrice from each item detail
      sanitizedQuoteFormValue.items.forEach((item: any) => {
        item.itemDetails.forEach((detail: any) => {
          delete detail.unitPrice;
        });
      });

      this._quoteService.saveQuotation(sanitizedQuoteFormValue).subscribe((res: Quotatation) => {
        this._router.navigate(['/quotations']);
      });
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
  }

  applyFormatting(i: number, j: number, textarea: HTMLTextAreaElement): void {
    const control = this.getItemDetailsControls(i).controls[j].get('detail') as FormControl;
    let currentValue = control.value;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    if (selectionStart === selectionEnd) return;

    const selectedText = currentValue.substring(selectionStart, selectionEnd);

    const isBold = /^\*{2}.*\*{2}$/.test(selectedText);

    let newText: string;
    if (isBold) {
      newText = currentValue.substring(0, selectionStart) + selectedText.substring(2, selectedText.length - 2) + currentValue.substring(selectionEnd);
    } else {
      const escapedText = selectedText.replace(/\\/g, '\\\\');
      const formattedText = `**${escapedText}**`.replace(/\n/g, ' ');
      newText = currentValue.substring(0, selectionStart) + formattedText + currentValue.substring(selectionEnd);
    }

    control.setValue(newText);
  }

  applyHighlighter(i: number, j: number, textarea: HTMLTextAreaElement): void {
    const control = this.getItemDetailsControls(i).controls[j].get('detail') as FormControl;
    let currentValue = control.value;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    if (selectionStart === selectionEnd) return;

    const selectedText = currentValue.substring(selectionStart, selectionEnd);

    const isBold = /^\{.*\}$/.test(selectedText);

    let newText: string;
    if (isBold) {
      newText = currentValue.substring(0, selectionStart) + selectedText.substring(1, selectedText.length - 1) + currentValue.substring(selectionEnd);
    } else {
      const escapedText = selectedText.replace(/\\/g, '\\\\');
      const formattedText = `{${escapedText}}`.replace(/\n/g, ' ');
      newText = currentValue.substring(0, selectionStart) + formattedText + currentValue.substring(selectionEnd);
    }

    control.setValue(newText);
  }

  calculateProfit(i: number, j: number) {
    const unitCost = this.getItemDetailsControls(i).controls[j].get('unitCost')?.value;
    const unitPrice = this.getItemDetailsControls(i).controls[j].get('unitPrice')?.value;
    if (unitCost && unitPrice) {
      const profit = ((unitPrice - unitCost) / unitPrice) * 100;
      this.getItemDetailsControls(i).controls[j].get('profit')?.setValue(profit.toFixed(2));
    } else if(unitCost) {
      this.getItemDetailsControls(i).controls[j].get('profit')?.setValue('');
    }
  }

  nonNegativeProfitValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      return value < 0 ? { negativeProfit: true } : null;
    };
  }

}
