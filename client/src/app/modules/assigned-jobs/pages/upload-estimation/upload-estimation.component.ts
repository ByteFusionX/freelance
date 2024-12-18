import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { Estimations } from 'src/app/shared/interfaces/enquiry.interface';
import { QuoteItemDetail } from 'src/app/shared/interfaces/quotation.interface';

@Component({
  selector: 'app-upload-estimation',
  templateUrl: './upload-estimation.component.html',
  styleUrls: ['./upload-estimation.component.css']
})
export class UploadEstimationComponent {
  submit: boolean = false;
  enqId!: string;
  isSaving: boolean = false;
  availabilityDefaultOptions: string[] = [
    "Ex-Stock",
    "Ex-Stock (Subject to Prior Sale)",
    "6-8 Weeks",
    "2-3 Weeks",
    "4-6 Weeks"
  ];
  availabiltyInput$ = new Subject<string>();

  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    public toastr: ToastrService,
    private _enquiryService: EnquiryService
  ) {
    this.getEnquiryId()
  }

  quoteForm = this._fb.group({
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
            unitPrice: [''],
            availability: ['', Validators.required],
          }),
        ])
      })
    ]),
    totalDiscount: ['', Validators.required],
    presaleNote: ['', Validators.required],
  });

  getEnquiryId() {
    const navigation = this._router.getCurrentNavigation();
    const isUpload = this._router.url.includes('upload-estimations')
    const isEdit = this._router.url.includes('edit-estimations')
    if (navigation && isUpload) {
      this.quoteForm.patchValue({ totalDiscount: '0' })
      this.enqId = navigation.extras.state?.['enquiryId']
    } else if (navigation && isEdit) {
      const estimations = navigation.extras.state?.['estimation']
      this.enqId = navigation.extras.state?.['enquiryId']
      this.items.clear()
      estimations.items.forEach((item: any, index: number) => {
        this.addItemFormGroup()
        item.itemDetails.forEach((_: any, ind: number) => {
          if (ind > 0) {
            this.addItemDetail(index)
          }
        })
      })
      this.quoteForm.patchValue({
        items: estimations.items,
        currency: estimations.currency,
        presaleNote: estimations.presaleNote,
        totalDiscount: estimations.totalDiscount,
      })
    } else {
      this._router.navigate(['/assigned-jobs']);
    }
  }

  get items(): FormArray {
    return this.quoteForm.get('items') as FormArray;
  }

  getItemDetailsControls(index: number): FormArray {
    return this.items?.at(index)?.get('itemDetails') as FormArray;
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
    this.getItemDetailsControls(index)?.push(this.createItemDetail());
  }

  onRemoveItem(index: number): void {
    this.items.removeAt(index);
  }

  onRemoveItemDetail(i: number, j: number) {
    this.getItemDetailsControls(i).removeAt(j);
  }

  get f() {
    return this.quoteForm.controls;
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

  calculateDiscoutPrice(): number {
    const totalDiscount = Number(this.quoteForm.get('totalDiscount')?.value) ?? 0;
    return this.calculateSellingPrice() - totalDiscount;
  }

  calculateProfit(i: number, j: number) {
    const unitCost = this.getItemDetailsControls(i).controls[j].get('unitCost')?.value;
    const unitPrice = this.getItemDetailsControls(i).controls[j].get('unitPrice')?.value;
    if (unitCost && unitPrice) {
        const profit = ((unitPrice - unitCost) / unitPrice) * 100;
        this.getItemDetailsControls(i).controls[j].get('profit')?.setValue(profit.toFixed(2));
    }
  }


  onSubmit() {
    this.submit = true;
    if (this.enqId && this.quoteForm.valid) {
      this.isSaving = true;
      const quoteForm = this.quoteForm.value
      const postBody = { items: quoteForm.items, enquiryId: this.enqId, currency: quoteForm.currency, preSaleNote: quoteForm.presaleNote, totalDiscount: quoteForm.totalDiscount }
      this._enquiryService.uploadEstimations(postBody).subscribe((data) => {
        if (data.success) {
          this.toastr.success('Estimation Updated!', 'Success')
          this._router.navigate(['/assigned-jobs']);
        } else {
          this.isSaving = false;
          this.toastr.warning('Something went Wrong!', 'Warning')
        }
      })

    } else {
      this.isSaving = false;
      this.toastr.warning('Check the fields properly!', 'Warning !')
    }

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

  formatNumber(value: any, minimumFractionDigits: number = 2, maximumFractionDigits: number = 2): string {
    if (isNaN(value)) {
      return '';
    }

    return parseInt(value).toLocaleString('en-US', {
      minimumFractionDigits,
      maximumFractionDigits
    });
  }

}
