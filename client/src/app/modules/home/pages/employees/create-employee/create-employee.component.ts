import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeDialog {

  constructor(
    public dialogRef: MatDialogRef<CreateEmployeeDialog>,
    public fb:FormBuilder
  ) { 
    fb.group({
      
    })
  }

  
  onClose(): void {
    this.dialogRef.close();
  }
}
