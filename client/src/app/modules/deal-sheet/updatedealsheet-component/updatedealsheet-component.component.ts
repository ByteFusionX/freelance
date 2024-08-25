import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { priceDetails, Quotatation, QuoteItem, QuoteItemDetail } from 'src/app/shared/interfaces/quotation.interface';

@Component({
  selector: 'app-updatedealsheet-component',
  templateUrl: './updatedealsheet-component.component.html',
  styleUrls: ['./updatedealsheet-component.component.css']
})
export class UpdatedealsheetComponent implements OnInit {
  costForm!: FormGroup;
  isSubmitted = false;
  isAllSelected = false;
  isSaving = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { approval: boolean, quoteData: Quotatation, quoteItems: (QuoteItem | undefined)[], priceDetails: priceDetails, quoteView: boolean },
    public dialogRef: MatDialogRef<UpdatedealsheetComponent>,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.costForm = this.fb.group({
      paymentTerms: [this.data.quoteData.dealData.paymentTerms || '', Validators.required],
      items: this.fb.array(this.data.quoteData.items.map(item => this.createItemGroup(item))),
      costs: this.fb.array([], this.additionalCostsValidator())
    });

    console.log(this.costForm.value);
  }

  onSubmit() {
    this.isSubmitted = true;

    if (this.costForm.invalid) {
      return;
    }
    this.isSaving = true;
    const formValue = this.costForm.value;
    const updatedItems = formValue.items.map((item: any) => ({
      ...item,
      itemDetails: item.itemDetails.map((detail: any) => ({
        ...detail,
        supplierName: detail.supplierName
      }))
    }));

    this.dialogRef.close({
      ...formValue,
      items: updatedItems
    });

  }

  get items(): FormArray {
    return this.costForm.get('items') as FormArray;
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
      supplierName: [detail.supplierName, this.supplierNameValidator()] // Apply supplierNameValidator here
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

  onItemCheckboxChange() {
    const allSelected = this.items.controls.every(item => {
      return this.getItemDetailsArray(item).every(detail => detail.get('dealSelected')?.value === true);
    });

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
}
