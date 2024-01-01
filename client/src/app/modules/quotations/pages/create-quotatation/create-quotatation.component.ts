import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NgSelectConfig } from '@ng-select/ng-select';

@Component({
  selector: 'app-create-quotatation',
  templateUrl: './create-quotatation.component.html',
  styleUrls: ['./create-quotatation.component.css']
})
export class CreateQuotatationComponent {
  selectedCustomer!: number;
  selectedContact!:number;
  selectedCurrency:string = "QAR";

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



  constructor(
    private config: NgSelectConfig
  ) {

    this.config.notFoundText = 'Custom not found';
    this.config.appendTo = 'body';
    // set the bindValue to global config when you use the same 
    // bindValue in most of the place. 
    // You can also override bindValue for the specified template 
    // by defining `bindValue` as property
    // Eg : <ng-select bindValue="some-new-value"></ng-select>
    this.config.bindValue = 'value';
    
  }
  createCustomer() {
    console.log("asdffffff");

  }
}
