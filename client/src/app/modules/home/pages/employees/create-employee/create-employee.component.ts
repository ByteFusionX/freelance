import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeDialog {
  constructor(
    public dialogRef: MatDialogRef<CreateEmployeeDialog>
  ) { }

  onClose(): void {
    this.dialogRef.close();
  }
}
