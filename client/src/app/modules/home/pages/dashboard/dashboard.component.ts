import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ChartOptions } from './dashboard.chart';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { Observable, Subscription } from 'rxjs';
import { TotalEnquiry } from 'src/app/shared/interfaces/enquiry.interface';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { opacityState } from 'src/app/shared/animations/animations.triggers';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [opacityState],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DashboardComponent implements OnInit, OnDestroy {

  quotes!: number;
  jobs!: number;
  graphSeries: { name: string, data: number[] }[] = [];
  graphCategory: string[] = [];
  showChart: boolean = false

  userId!: string | undefined;
  enquiryAccess!: string | undefined;
  quoteAccess!: string | undefined;

  isEnquiryLoading: boolean = true;
  isQuoteLoading: boolean = true;

  enquiries$!: Observable<TotalEnquiry[]>;
  userData$!: Observable<getEmployee | undefined>;
  quotations$!: Observable<{ total: number }>;

  private subscriptions = new Subscription()
  public chartOptions!: Partial<ChartOptions>;

  constructor(
    private _enquiryService: EnquiryService,
    private _employeeService: EmployeeService,
    private _quotationService: QuotationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // this._employeeService.employeeData$.subscribe((employee) => {


    // })
    this.userData$ = this._employeeService.employeeData$
    this.userData$.subscribe((employee) => {
      if (employee) {
        this.enquiryAccess = employee?.category.privileges.enquiry.viewReport
        this.quoteAccess = employee?.category.privileges.quotation.viewReport
        this.userId = employee?._id;
        this.enquiries$ = this._enquiryService.totalEnquiries(this.enquiryAccess, this.userId);
        this.enquiryLoading()

        console.log(this.userId)
        this.quotations$ = this._quotationService.totalQuotations(this.quoteAccess, this.userId)
        this.quoteLoading();

        this.getChartDetails()
      }
    })

    this.dateCategories()
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  enquiryLoading() {
    this.subscriptions.add(
      this.enquiries$.subscribe({
        next: ((data) => {
          if (data) {
            this.isEnquiryLoading = false
          }
        }),
        error: ((err) => {
          this.isEnquiryLoading = true
        })
      })
    )
  }

  quoteLoading() {
    this.subscriptions.add(
      this.quotations$.subscribe({
        next: ((data) => {
          if (data) {
            this.isQuoteLoading = false
          }
        }),
        error: ((err) => {
          this.isQuoteLoading = true
        })
      })
    )
  }

  dateCategories() {
    let currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const formattedDate = `${year}-${month.toString().padStart(2, '0')}`;
      this.graphCategory.unshift(formattedDate);
      currentDate.setMonth(currentDate.getMonth() - 1);
    }
  }

  onDepartmentSelect(departmentId: string | undefined) {
    if (departmentId) {
      this._enquiryService.depSubject.next(departmentId)
      this.router.navigate(['/enquiry'])
    }
  }

  getChartDetails() {
    this.subscriptions.add(
      this._enquiryService.monthlyEnquiries(this.enquiryAccess, this.userId).subscribe((data) => {
        data.map((item) => {
          const dateArray: number[] = new Array(12).fill(0)
          let depName = item.department[0].departmentName.toUpperCase()
          let dep = this.graphSeries.find((ser) => ser.name == depName)

          if (!dep) {
            let obj = { name: depName, data: dateArray }
            this.graphSeries.push(obj)
            dep = this.graphSeries[this.graphSeries.length - 1]
          }

          let date: string = `${item.year}-${item.month.toString().padStart(2, '0')}`
          let index = this.graphCategory.indexOf(date)
          dep.data[index] = item.total
        })
        this.chartDetails()
      })
    )
  }

  chartDetails() {
    this.chartOptions = {
      series: this.graphSeries,
      chart: {
        height: 350,
        type: "area",
        toolbar: {
          show: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        type: "datetime",
        categories: this.graphCategory
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      }
    };
    this.showChart = true;
  }
}
