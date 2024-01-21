import { Component } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationExtras, Router } from '@angular/router';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { quotatation, QuoteStatus } from 'src/app/shared/interfaces/quotation.interface';

@Component({
  selector: 'app-quotation-list',
  templateUrl: './quotation-list.component.html',
  styleUrls: ['./quotation-list.component.css']
})
export class QuotationListComponent {
  isLoading:boolean = true;
  submit: boolean = false
  dateError: boolean = false
  selectedSalesPerson!: number;;
  selectedDepartment!: number;
  dataSource!: MatTableDataSource<quotatation>;
  quoteStatuses = Object.values(QuoteStatus);

  displayedColumns: string[] = ['slNo', 'date', 'quoteId', 'customerName', 'description', 'salesPerson', 'department', 'status', 'action'];

  constructor(
    private _fb: FormBuilder,
    private _quoteService: QuotationService,
    private _router:Router
  ) { }

  ngOnInit(){
    this.getQuotation()
  }
  

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


  onQuote(data:quotatation){
    const navigationExtras: NavigationExtras = {
      state: data
    };
    
    this._router.navigate(['/quotations/view'], navigationExtras);
  }

  onQuoteEdit(data:quotatation){
    const navigationExtras: NavigationExtras = {
      state: data
    };
    
    this._router.navigate(['/quotations/edit'], navigationExtras);
  }

  handleNotClose(event: MouseEvent) {
    event.stopPropagation();
  }

  getQuotation(){
    this._quoteService.getQuotation().subscribe((data:quotatation[])=>{
      this.dataSource = new MatTableDataSource(data);
      this.isLoading = false;
    })
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

  updateStatus(i:number,quoteId:string){
    const selectedValue = this.dataSource.data[i].status;
    this._quoteService.updateQuoteStatus(quoteId,selectedValue).subscribe((res)=>{
      
    })
  }
}
