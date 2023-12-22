import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.css']
})
export class CreateCustomerDialog {
  
  constructor(public dialogRef: MatDialogRef<CreateCustomerDialog>,private fb: FormBuilder) { }

  customerForm: FormGroup = this.fb.group({
    contactDetails:this.fb.array([]),
  })

  get contactDetails(): FormArray {
    return this.customerForm.get('contactDetails') as FormArray;
  }

  onAddContact(): void {
    this.contactDetails.push(this.fb.control(''));
  }
  
  onRemoveContact(index: number): void {
    this.contactDetails.removeAt(index);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
