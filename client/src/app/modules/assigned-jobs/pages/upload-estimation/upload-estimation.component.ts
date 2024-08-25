import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
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

  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    public toastr: ToastrService,
    private _enquiryService: EnquiryService
  ) {
    this.getEnquiryId()
  }

  quoteForm = this._fb.group({
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
    ])
  });

  getEnquiryId() {
    const navigation = this._router.getCurrentNavigation();
    const isUpload = this._router.url.includes('upload-estimations')
    const isEdit = this._router.url.includes('edit-estimations')
    if (navigation && isUpload) {
      this.enqId = navigation.extras.state?.['enquiryId']
    } else if (navigation && isEdit) {
      const items = navigation.extras.state?.['items']
      this.enqId = navigation.extras.state?.['enquiryId']
      this.quoteForm.patchValue({ items: items })
    } else {
      this._router.navigate(['/assigned-jobs']);
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

  onRemoveItem(index: number): void {
    this.items.removeAt(index);
  }

  onRemoveItemDetail(i: number, j: number) {
    this.getItemDetailsControls(i).removeAt(j);
  }


  calculateTotalCost(i: number, j: number) {
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

  onSubmit() {
    this.submit = true;
    if (this.enqId && this.quoteForm.valid) {
      this.isSaving = true;
      const postBody = { items: this.quoteForm.value.items, enquiryId: this.enqId }
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



}
