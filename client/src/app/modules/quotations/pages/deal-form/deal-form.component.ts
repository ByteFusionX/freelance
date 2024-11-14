import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fileEnterState } from 'src/app/modules/enquirys/enquiry-animations';
import { Quotatation, QuoteItemDetail } from 'src/app/shared/interfaces/quotation.interface';

@Component({
  selector: 'app-deal-form',
  templateUrl: './deal-form.component.html',
  styleUrls: ['./deal-form.component.css'],
  animations: [fileEnterState],
})
export class DealFormComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  isSaving: boolean = false;
  isSubmitted: boolean = false;
  isAllSelected: boolean = false;
  costForm!: FormGroup;
  selectedFiles: any[] = [];

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
      supplierName: ['', this.supplierNameValidator()],
      phoneNo: ['', this.supplierNameValidator()],
      email: ['', [this.supplierNameValidator(), Validators.email]],
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

  onItemCheckboxChange(i: number, j: number, event: any) {
    const allSelected = this.items.controls.every(item => {
      return this.getItemDetailsArray(item).every(detail => detail.get('dealSelected')?.value === true);
    });

    if (!event.target.checked) {
      this.getItemDetailsArray(this.items.controls[i])[j].get('quantity')?.setValue(this.data.items[i].itemDetails[j].quantity)
      this.getItemDetailsArray(this.items.controls[i])[j].get('unitCost')?.setValue(this.data.items[i].itemDetails[j].unitCost)
      this.getItemDetailsArray(this.items.controls[i])[j].get('profit')?.setValue(this.data.items[i].itemDetails[j].profit)
      this.getItemDetailsArray(this.items.controls[i])[j].get('supplierName')?.setValue('')
      this.getItemDetailsArray(this.items.controls[i])[j].get('phoneNo')?.setValue('')
      this.getItemDetailsArray(this.items.controls[i])[j].get('email')?.setValue('')
    }

    this.isAllSelected = allSelected;
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
    (this.selectedFiles as File[]).splice(index, 1)
    this.fileInput.nativeElement.value = '';
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
      }))
    }));
    formData.append('dealData', JSON.stringify({ ...data, items: updatedItems }));
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

  get f() {
    return this.costForm.controls;
  }

  getItemDetailsControls(index: number): FormArray {
    return this.items.at(index).get('itemDetails') as FormArray;
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

  calculateSellingPrice(): number {
    let totalCost = 0;
    this.items.value.forEach((item: any, i: number) => {
      this.getItemDetailsControls(i).value.forEach((item: any, j: number) => {
        if(item.dealSelected){
          totalCost += this.calculateTotalPrice(i, j)
        }
      })
    })
    return totalCost;
  }

  calculateAllTotalCost() {
    let totalCost = 0;
    this.items.value.forEach((item: any, i: number) => {
      this.getItemDetailsControls(i).value.forEach((item: any, j: number) => {
        if(item.dealSelected){
          totalCost += this.calculateTotalCost(i, j)
        }
      })
    })

    return totalCost;
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

  onClose() {
    this.dialogRef.close()
  }

}
