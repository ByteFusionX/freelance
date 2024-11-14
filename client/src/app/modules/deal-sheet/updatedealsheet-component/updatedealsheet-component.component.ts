import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { priceDetails, Quotatation, QuoteItem, QuoteItemDetail } from 'src/app/shared/interfaces/quotation.interface';
import { fileEnterState } from '../../enquirys/enquiry-animations';

@Component({
  selector: 'app-updatedealsheet-component',
  templateUrl: './updatedealsheet-component.component.html',
  styleUrls: ['./updatedealsheet-component.component.css'],
  animations: [fileEnterState],
})
export class UpdatedealsheetComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  costForm!: FormGroup;
  isSubmitted = false;
  isAllSelected = false;
  isSaving = false;
  selectedFiles: any[] = [];
  removedFiles: any[] = [];
  existingFiles: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { approval: boolean, quoteData: Quotatation, quoteItems: (QuoteItem | undefined)[], priceDetails: priceDetails, quoteView: boolean },
    public dialogRef: MatDialogRef<UpdatedealsheetComponent>,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    console.log(this.data.quoteItems)
    this.costForm = this.fb.group({
      paymentTerms: [this.data.quoteData.dealData.paymentTerms || '', Validators.required],
      items: this.fb.array(this.data.quoteItems.map(item => this.createItemGroup(item as QuoteItem))),
      costs: this.fb.array([], this.additionalCostsValidator())
    });

    this.selectedFiles = this.data.quoteData.dealData.attachments;
    this.existingFiles = [...this.selectedFiles]
  }

  setUpFormData(): FormData {
    let formData = new FormData();

    let data = this.costForm.value;
    const updatedItems = data.items.map((item: any) => ({
      ...item,
      itemDetails: item.itemDetails.map((detail: any) => ({
        ...detail,
        supplierName: detail.supplierName,
        phoneNo: detail.phoneNo,
        email: detail.email,
      })),
    }));
    formData.append('dealData', JSON.stringify({ ...data, items: updatedItems, removedFiles: this.removedFiles, existingFiles: this.existingFiles }));
    for (let i = 0; i < this.selectedFiles.length; i++) {
      formData.append('attachments', (this.selectedFiles[i] as Blob))
    }

    return formData;
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.costForm.valid) {
      this.isSaving = true;
      const formData = this.setUpFormData()
      this.dialogRef.close(formData);
    }
  }

  get items(): FormArray {
    return this.costForm.get('items') as FormArray;
  }

  get f() {
    return this.costForm.controls;
  }

  onFileSelected(event: any) {
    let files = event.target.files
    for (let i = 0; i < files.length; i++) {
      const newFile = files[i]
      const exist = (this.selectedFiles as File[]).some((file: File) => file.name === newFile.name)
      if (!exist) {
        (this.selectedFiles as File[]).push(files[i])
      }
    }
  }

  onFileRemoved(index: number) {
    let removedFiles = (this.selectedFiles as File[]).splice(index, 1)
    this.existingFiles.splice(index, 1)
    this.removedFiles.push(...removedFiles)
  }


  createItemGroup(item: QuoteItem): FormGroup {
    return this.fb.group({
      itemName: [item.itemName || ''],
      itemDetails: this.fb.array(item.itemDetails.map(detail => this.createItemDetailGroup(detail)))
    });

  }

  createItemDetailGroup(detail: QuoteItemDetail): FormGroup {
    return this.fb.group({
      dealSelected: [detail.dealSelected || false],
      detail: [detail.detail || ''],
      quantity: [detail.quantity || 0],
      unitCost: [detail.unitCost || 0],
      profit: [detail.profit || 0],
      availability: [detail.availability || ''],
      supplierName: [detail.supplierName, this.supplierNameValidator()],
      phoneNo: [detail.phoneNo, this.supplierNameValidator()],
      email: [detail.email, [this.supplierNameValidator(), Validators.email]],
    });
  }

  supplierNameValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const formGroup = control.parent as FormGroup;
      if (formGroup) {
        const dealSelected = formGroup.get('dealSelected')?.value;
        if (dealSelected && !control.value) {
          return { 'supplierNameRequired': true };
        }
      }
      return null;
    };
  }

  get paymentTermsControl(): AbstractControl {
    return this.costForm.get('paymentTerms')!;
  }

  additionalCostsValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const costs = control as FormArray;

      if (costs.length === 0) {
        return null;
      }

      for (const cost of costs.controls) {
        if (!cost.get('name')?.value || !cost.get('value')?.value) {
          return { 'additionalCostInvalid': true };
        }
      }
      return null;
    };
  }

  onItemCheckboxChange(i: number, j: number, event: any) {
    const allSelected = this.items.controls.every(item => {
      return this.getItemDetailsArray(item).every(detail => detail.get('dealSelected')?.value === true);
    });

    if (!event.target.checked) {
      this.getItemDetailsArray(this.items.controls[i])[j].get('supplierName')?.setValue('')
      this.getItemDetailsArray(this.items.controls[i])[j].get('phoneNo')?.setValue('')
      this.getItemDetailsArray(this.items.controls[i])[j].get('email')?.setValue('')
    }

    this.isAllSelected = allSelected;
  }

  toggleAllSelection(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isAllSelected = isChecked;
    this.items.controls.forEach(item => {
      const itemDetails = this.getItemDetailsArray(item);
      itemDetails.forEach(detail => {
        detail.get('dealSelected')?.setValue(isChecked);
      });
    });
  }

  getItemDetailsArray(item: AbstractControl): AbstractControl[] {
    return (item.get('itemDetails') as FormArray).controls;
  }

  addCost(): void {
    this.costs.push(this.fb.group({
      name: ['', Validators.required],
      value: ['', Validators.required]
    }));
  }

  removeCost(index: number): void {
    this.costs.removeAt(index);
  }

  get costs(): FormArray {
    return this.costForm.get('costs') as FormArray;
  }

  trackByIndex(index: number): number {
    return index;
  }

  onClose() {
    this.dialogRef.close();
  }

  getItemDetailsControls(index: number): FormArray {
    return this.items.at(index).get('itemDetails') as FormArray;
  }
}
