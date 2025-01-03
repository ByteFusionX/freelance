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
import { Quotatation, getQuotatation, quotatationForm } from 'src/app/shared/interfaces/quotation.interface';
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
      items: this._fb.array([
        this._fb.group({
          itemName: ['', Validators.required],
          itemDetails: this._fb.array([
            this._fb.group({
              detail: ['', Validators.required],
              quantity: ['', Validators.required],
              unitCost: ['', Validators.required],
              profit: ['', [Validators.required, this.nonNegativeProfitValidator()]],
              unitPrice: [''],
              availability: ['', Validators.required],
            }),
          ])
        })
      ]),
      totalDiscount: ['', Validators.required],
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
      this.items.clear()
      this.quoteData.items.forEach((item: any, index: number) => {
        this.addItemFormGroup()
        item.itemDetails.forEach((_: any, ind: number) => {
          if (ind > 0) {
            this.addItemDetail(index)
          }
        })
      })

      this.quoteForm.patchValue(this.quoteData)

      this.quoteData.items.forEach((item:any,i:number)=>{
        item.itemDetails.forEach((itemDetail:any,j:number)=>{
          if(itemDetail){
            this.calculateUnitPriceForInput(i,j)
          }
        })
      })
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
          profit: ['', [Validators.required, this.nonNegativeProfitValidator()]],
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
      profit: ['', [Validators.required, this.nonNegativeProfitValidator()]],
      unitPrice: [''],
      availability: ['', Validators.required]
    });
  }

  addItemDetail(index: number): void {
    this.getItemDetailsControls(index).push(this.createItemDetail());
  }


  getAllCustomers() {
    let userId;
    this._employeeService.employeeData$.subscribe((data)=>{
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
        itemDetails: this._fb.array(item.itemDetails.map((detail:any) => this._fb.group({
          detail: detail.detail,
          quantity: detail.quantity,
          unitCost: detail.unitCost,
          profit: detail.profit,
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

  calculateProfit(i: number, j: number) {
    const unitCost = this.getItemDetailsControls(i).controls[j].get('unitCost')?.value;
    const unitPrice = this.getItemDetailsControls(i).controls[j].get('unitPrice')?.value;
    if (unitCost && unitPrice) {
        const profit = ((unitPrice - unitCost) / unitPrice) * 100;
        this.getItemDetailsControls(i).controls[j].get('profit')?.setValue(profit.toFixed(2));
    }
  }

  async onDownloadPdf(includeStamp:boolean) {
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

        const pdfDoc = await this._quoteService.generatePDF(finalQuoteData, true);
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

  checkTextSelection(textarea: HTMLTextAreaElement) {
    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    this.isTextSelected = selectedText.length > 0;
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

  nonNegativeProfitValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      return value < 0 ? { negativeProfit: true } : null;
    };
  }

}
