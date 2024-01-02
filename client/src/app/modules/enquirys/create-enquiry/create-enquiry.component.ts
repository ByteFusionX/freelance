import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgSelectConfig } from '@ng-select/ng-select';

@Component({
  selector: 'app-create-enquiry',
  templateUrl: './create-enquiry.component.html',
  styleUrls: ['./create-enquiry.component.css']
})
export class CreateEnquiryDialog {
  selectedCustomer!: number;
  selectedContact!:number;

  constructor(
    public dialogRef: MatDialogRef<CreateEnquiryDialog>,
    private config: NgSelectConfig,
    private _fb : FormBuilder
  ) {
    this.config.notFoundText = 'Custom not found';
    this.config.appendTo = 'body';

    this.config.bindValue = 'value';
  }


  customers: { id: number, name: string }[] = [
    { id: 1, name: 'Company' },
    { id: 2, name: 'Company2' },
    { id: 3, name: 'Company3' },
    { id: 4, name: 'Company4' },
  ];

  contacts: { id: number, name: string }[] = [
    { id: 1, name: 'Contact1' },
    { id: 2, name: 'Contact2' },
    { id: 3, name: 'Contact3' },
    { id: 4, name: 'Contact4' },
  ];

  formData = this._fb.group({
    date:['']
  })

  
  
  onClose() {
    this.dialogRef.close()
  }

  createCustomer() {
    

  }
}
