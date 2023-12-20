import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.css']
})
export class CreateCustomerDialog {
  constructor(public dialogRef: MatDialogRef<CreateCustomerDialog>) { }

  onClose(): void {
    this.dialogRef.close();
  }
}
