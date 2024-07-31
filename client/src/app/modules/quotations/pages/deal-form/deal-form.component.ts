import { Component, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Quotatation, QuoteItemDetail } from 'src/app/shared/interfaces/quotation.interface';

@Component({
  selector: 'app-deal-form',
  templateUrl: './deal-form.component.html',
  styleUrls: ['./deal-form.component.css']
})
export class DealFormComponent {
  isSaving: boolean = false;
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
      costs: this.fb.array([])
    });
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
      dealSelected:[false],
      detail: [detail.detail],
      quantity: [detail.quantity],
      unitCost: [detail.unitCost],
      profit: [detail.profit],
      availability: [detail.availability],
      supplierName: ['']
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
      name: ['',Validators.required],
      value: ['',Validators.required]
    }));
  }

  removeCost(index: number): void {
    this.costs.removeAt(index);
  }

  onSubmit() {
    if (this.costForm.valid) {
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

  onClose() {
    this.dialogRef.close()
  }

}
