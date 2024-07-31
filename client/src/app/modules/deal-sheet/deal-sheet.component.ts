import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { getDealSheet, getQuotation, Quotatation, QuoteItem } from 'src/app/shared/interfaces/quotation.interface';
import { ApproveDealComponent } from './approve-deal/approve-deal.component';

@Component({
  selector: 'app-deal-sheet',
  templateUrl: './deal-sheet.component.html',
  styleUrls: ['./deal-sheet.component.css']
})
export class DealSheetComponent {
  isLoading: boolean = true;
  isEmpty: boolean = false;
  loader = this.loadingBar.useRef();

  displayedColumns: string[] = ['dealId', 'quoteId', 'customerName', 'description', 'salesPerson', 'department', 'paymentTerms', 'action'];

  dataSource = new MatTableDataSource<Quotatation>()

  total: number = 0;
  page: number = 1;
  row: number = 10;

  private subscriptions = new Subscription();
  private subject = new BehaviorSubject<{ page: number, row: number }>({ page: this.page, row: this.row });

  constructor(
    private _quoteService: QuotationService,
    private _router: Router,
    private _dialog: MatDialog,
    private _employeeService: EmployeeService,
    private loadingBar: LoadingBarService
  ) { }

  ngOnInit() {
    this.subscriptions.add(
      this.subject.subscribe((data) => {
        this.page = data.page
        this.row = data.row
        this.getDealSheet()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  getDealSheet() {
    this.isLoading = true;
    let access;
    let userId;
    this._employeeService.employeeData$.subscribe((employee) => {
      access = employee?.category.privileges.quotation.viewReport
      userId = employee?._id
    })

    let filterData = {
      page: this.page,
      row: this.row,
      access: access,
      userId: userId
    }
    this.subscriptions.add(
      this._quoteService.getDealSheet(filterData)
        .subscribe((data: getDealSheet) => {
          console.log(data)
          if (data) {
            this.dataSource.data = [...data.dealSheet];
            this.dataSource._updateChangeSubscription()
            this.total = data.total
            this.isEmpty = false
          } else {
            this.dataSource.data = [];
            this.isEmpty = true;
          }
          this.isLoading = false
        })
    )

  }

  onPreviewDeal(approval: boolean, quoteData: Quotatation,index:number) {

    let priceDetails = {
      totalSellingPrice: 0,
      totalCost: 0,
      profit: 0,
      perc: 0
    }

    const quoteItems = quoteData.items.map((item) => {
      let itemSelected = 0;

      item.itemDetails.map((itemDetail) => {
        if (itemDetail.dealSelected) {
          itemSelected++;
          priceDetails.totalSellingPrice += itemDetail.unitCost / (1 - (itemDetail.profit / 100)) * itemDetail.quantity;
          priceDetails.totalCost += itemDetail.quantity * itemDetail.unitCost;
          return itemDetail
        }
        return;
      })

      if (itemSelected) return item;

      return;
    });

    priceDetails.profit = priceDetails.totalSellingPrice - priceDetails.totalCost;
    priceDetails.perc = (priceDetails.profit / priceDetails.totalSellingPrice) * 100

    const dialogRef = this._dialog.open(ApproveDealComponent,
      {
        data: { approval, quoteData, quoteItems, priceDetails },
        width: '900px'
      });

    dialogRef.afterClosed().subscribe((approve: boolean) => {
      if(approve){
        this._quoteService.approveDeal(quoteData._id).subscribe((res)=>{
          if(res.success){
            this.dataSource.data.splice(index, 1)
            this.dataSource._updateChangeSubscription()
            if(this.dataSource.data.length == 0){
              this.isEmpty = true;
            }
          }
        })
      }

    })
  }

  // onRowClicks(index: number) {
  //   let data = this.dataSource.data[index]
  //   const navigationExtras: NavigationExtras = {
  //     state: data
  //   };

  //   this._router.navigate(['/quotations/view'], navigationExtras);
  // }



  onPageNumberClick(event: { page: number, row: number }) {
    this.subject.next(event)
  }
}
