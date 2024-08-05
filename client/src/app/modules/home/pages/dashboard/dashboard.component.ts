import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ChartOptions } from './dashboard.chart';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { Observable, Subscription } from 'rxjs';
import { TotalEnquiry } from 'src/app/shared/interfaces/enquiry.interface';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { getEmployee, Privileges } from 'src/app/shared/interfaces/employee.interface';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { opacityState } from 'src/app/shared/animations/animations.triggers';
import { Router } from '@angular/router';
import { JobService } from 'src/app/core/services/job/job.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [opacityState]
})

export class DashboardComponent implements OnInit, OnDestroy {

  quotes!: number;
  jobs!: number;
  presales!: { pending: number, completed: number };
  graphSeries: { name: string, data: number[] }[] = [];
  graphCategory: string[] = [];
  showChart: boolean = false
  privileges!: Privileges | undefined;

  userId!: string | undefined;
  enquiryAccess!: string | undefined;
  quoteAccess!: string | undefined;
  jobAccess!: string | undefined;

  isEnquiryLoading: boolean = true;
  isQuoteLoading: boolean = true;
  isJobLoading: boolean = true;
  isPresalesLoading: boolean = true;

  enquiries$!: Observable<TotalEnquiry[]>;
  userData$!: Observable<getEmployee | undefined>;
  quotations$!: Observable<{ total: number }>;
  jobs$!: Observable<{ total: number }>;
  presales$!: Observable<{ pending: number, completed: number }>;

  private subscriptions = new Subscription()
  public chartOptions!: Partial<ChartOptions>;

  constructor(
    private _enquiryService: EnquiryService,
    private _profileService: ProfileService,
    private _employeeService: EmployeeService,
    private _quotationService: QuotationService,
    private _jobService: JobService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userData$ = this._employeeService.employeeData$
    this.userData$.subscribe((employee) => {
      if (employee) {
        this.privileges = employee?.category?.privileges
        this.userId = employee?._id;

        if (this.privileges?.dashboard?.totalEnquiry) {
          this.enquiryAccess = employee?.category.privileges.enquiry.viewReport
          this.enquiries$ = this._profileService.totalEnquiries(this.enquiryAccess, this.userId);
          this.enquiryLoading()
        }

        if (this.privileges?.dashboard?.totalQuote) {
          this.quoteAccess = employee?.category.privileges.quotation.viewReport;
          this.quotations$ = this._quotationService.totalQuotations(this.quoteAccess, this.userId)
          this.quoteLoading();
        }

        if (this.privileges?.dashboard?.totalJobs) {
          this.jobAccess = employee?.category.privileges.jobSheet.viewReport
          this.jobs$ = this._jobService.totalJobs(this.jobAccess, this.userId)
          this.jobLoading();
        }

        if (this.privileges?.dashboard?.totalPresale) {
          this.presales$ = this._enquiryService.presalesCounts(this.jobAccess, this.userId)
          this.presalesLoading();
        }

        if (this.privileges?.dashboard?.EnquiryChart) {
          this.getChartDetails()
        }
      }
    }).unsubscribe()


    this.dateCategories()
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

  presalesLoading() {
    this.subscriptions.add(
      this.presales$.subscribe({
        next: ((data) => {
          if (data) {
            this.isPresalesLoading = false
          }
        }),
        error: ((err) => {
          this.isPresalesLoading = true
        })
      })
    )
  }

  quoteLoading() {
    this.subscriptions.add(
      this.quotations$.subscribe({
        next: ((data) => {
          if (data) {
            console.log(data)
            this.isQuoteLoading = false
          }
        }),
        error: ((err) => {
          this.isQuoteLoading = true
        })
      })
    )
  }

  jobLoading() {
    this.subscriptions.add(
      this.jobs$.subscribe({
        next: ((data) => {
          if (data) {
            this.isJobLoading = false
          }
        }),
        error: ((err) => {
          this.isJobLoading = true
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

  onClickLearnButton() {
    window.open('https://neuron.com.qa/')
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


  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
}
