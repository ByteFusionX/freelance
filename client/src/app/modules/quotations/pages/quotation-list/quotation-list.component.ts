import { Component } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-quotation-list',
  templateUrl: './quotation-list.component.html',
  styleUrls: ['./quotation-list.component.css']
})
export class QuotationListComponent {

  constructor(private _fb: FormBuilder) {
  }
  submit: boolean = false
  dateError: boolean = false

  selectedSalesPerson!: number;;
  selectedDepartment!: number;

  salesPerson: { id: number, name: string }[] = [
    { id: 2, name: 'Name1' },
    { id: 5, name: 'Name2' },
    { id: 3, name: 'Name3' },
    { id: 4, name: 'Name4' },
  ];

  departments: { id: number, name: string }[] = [
    { id: 1, name: 'ICT' },
    { id: 2, name: 'Security System' },
    { id: 3, name: 'Distribution ' },
  ];


  formData = this._fb.group({
    fromDate: [new FormControl()],
    toDate: [new FormControl()],
  })


  displayedColumns: string[] = ['slNo', 'date', 'quoteId', 'customerName', 'description', 'salesPerson', 'department', 'status', 'action'];
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

  handleNotClose(event: MouseEvent) {
    event.stopPropagation();
  }

  onSubmit() {
    this.submit = true
    if (this.formData.value.fromDate > this.formData.value.toDate) {
      this.dateError = true
      setTimeout(() => {
        this.dateError = false
      }, 3000);
    } else if (this.formData.value.fromDate < this.formData.value.toDate) {
      this.dateError = false
    } else {

    }
  }
}
