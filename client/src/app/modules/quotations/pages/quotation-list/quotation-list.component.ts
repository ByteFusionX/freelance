import { Component } from '@angular/core';
import { CreateQuotatationComponent } from '../create-quotatation/create-quotatation.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-quotation-list',
  templateUrl: './quotation-list.component.html',
  styleUrls: ['./quotation-list.component.css']
})
export class QuotationListComponent {

  constructor(public dialog: MatDialog) { }

  displayedColumns: string[] = ['slNo','date', 'quoteId', 'customerName', 'description','salesPerson', 'department', 'status'];
  dataSource = [
    {
      date: '2023-01-01',
      quoteId: 'Q1001',
      customerName: 'Customer A',
      description: 'Product A',
      salesPerson: 'John Doe',
      department: 'Sales',
      status: 'Pending'
    },
    {
      date: '2023-02-15',
      quoteId: 'Q1002',
      customerName: 'Customer B',
      description: 'Product B',
      salesPerson: 'Jane Smith',
      department: 'Marketing',
      status: 'Approved'
    },
    {
      date: '2023-12-20',
      quoteId: 'Q1010',
      customerName: 'Customer J',
      description: 'Product J',
      salesPerson: 'Alex Johnson',
      department: 'Operations',
      status: 'Completed'
    }
  ];

  openDialog() {
    const dialogRef = this.dialog.open(CreateQuotatationComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
