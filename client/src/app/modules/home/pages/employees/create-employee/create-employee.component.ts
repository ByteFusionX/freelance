import { Component } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeDialog {
  constructor(
    public dialogRef: MatDialogRef<CreateEmployeeDialog>,
    private _fb:FormBuilder
  ) { }

  onClose(): void {
    this.dialogRef.close();
  }

  formData = this._fb.group({
    dateOfBirth:[new FormControl()],
    joinedDate:[new FormControl()],
  })
}
