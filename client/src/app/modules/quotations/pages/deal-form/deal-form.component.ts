import { Component, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Quotatation, QuoteItemDetail } from 'src/app/shared/interfaces/quotation.interface';

@Component({
  selector: 'app-deal-form',
  templateUrl: './deal-form.component.html',
  styleUrls: ['./deal-form.component.css']
})
export class DealFormComponent {
  isSaving: boolean = false;
  isSubmitted: boolean = false;
  isAllSelected: boolean = false;
  costForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DealFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Quotatation,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.costForm = this.fb.group({
      paymentTerms: ['', Validators.required],
      items: this.fb.array(this.data.items.map(item => this.createItemGroup(item))),
      costs: this.fb.array([], this.additionalCostsValidator())
    });
  }


  get paymentTermsControl(): AbstractControl {
    return this.costForm.get('paymentTerms')!;
  }

  get costs(): FormArray {
    return this.costForm.get('costs') as FormArray;
  }

  createItemGroup(item: any): FormGroup {
    return this.fb.group({
      itemName: [item.itemName],
      itemDetails: this.fb.array(item.itemDetails.map((detail: QuoteItemDetail) => this.createItemDetailGroup(detail)))
    });
  }

  createItemDetailGroup(detail: QuoteItemDetail): FormGroup {
    return this.fb.group({
      dealSelected: [false],
      detail: [detail.detail],
      quantity: [detail.quantity],
      unitCost: [detail.unitCost],
      profit: [detail.profit],
      availability: [detail.availability],
      supplierName: ['', this.supplierNameValidator()]
    });
  }

  getItemDetailsArray(item: AbstractControl): AbstractControl[] {
    return (item.get('itemDetails') as FormArray).controls;
  }

  get items(): FormArray {
    return this.costForm.get('items') as FormArray;
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

  onItemCheckboxChange() {
    const allSelected = this.items.controls.every(item => {
      return this.getItemDetailsArray(item).every(detail => detail.get('dealSelected')?.value === true);
    });

    this.isAllSelected = allSelected;
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.costForm.valid) {
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
  }


  additionalCostsValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const costs = control as FormArray;

      if (costs.length === 0) {
        return null;
      }

      for (const cost of costs.controls) {
        if (!cost?.get('name')?.value || !cost?.get('value')?.value) {
          return { 'additionalCostInvalid': true };
        }
      }
      return null;
    };
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

  onClose() {
    this.dialogRef.close()
  }

}
