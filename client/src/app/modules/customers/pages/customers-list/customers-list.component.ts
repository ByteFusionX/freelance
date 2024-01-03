import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateCustomerDialog } from '../create-customer/create-customer.component';

@Component({
  selector: 'app-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.css']
})
export class CustomersListComponent {

  constructor(public dialog: MatDialog) { }
  displayedColumns: string[] = ['position', 'name', 'createdBy', 'department'];
  dataSource = [
    { name: 'Basim', creator: 'Mhd Shamil', department: 'department#1' },
    { name: 'Basim', creator: 'Mhd Shamil', department: 'department#1' },
    { name: 'Basim', creator: 'Mhd Shamil', department: 'department#1' },
    { name: 'Basim', creator: 'Mhd Shamil', department: 'department#1' },
    { name: 'Basim', creator: 'Mhd Shamil', department: 'department#1' },
    { name: 'Basim', creator: 'Mhd Shamil', department: 'department#1' },
    { name: 'Basim', creator: 'Mhd Shamil', department: 'department#1' },
    { name: 'Basim', creator: 'Mhd Shamil', department: 'department#1' },
    { name: 'Basim', creator: 'Mhd Shamil', department: 'department#1' },
    { name: 'Basim', creator: 'Mhd Shamil', department: 'department#1' },
    { name: 'Basim', creator: 'Mhd Shamil', department: 'department#1' },
    { name: 'Basim', creator: 'Mhd Shamil', department: 'department#1' },
  ];

  // openDialog() {
  //   const dialogRef = this.dialog.open(CreateCustomerDialog);

  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log(`Dialog result: ${result}`);
  //   });
  // }

}
