import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartOptions } from './dashboard.chart';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { Observable, Subscription } from 'rxjs';
import { TotalEnquiry } from 'src/app/shared/interfaces/enquiry.interface';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit, OnDestroy {

  enquiries$!: Observable<TotalEnquiry[]>;
  quotes!: number;
  jobs!: number;
  graphSeries: { name: string, data: number[] }[] = []
  graphCategory: string[] = []
  isLoading: boolean = true
  userData$!: Observable<getEmployee>;

  private subscriptions = new Subscription()
  public chartOptions!: Partial<ChartOptions>;

  constructor(private enquiryService: EnquiryService, private _employeeService: EmployeeService) { }

  ngOnInit(): void {
    let token = this._employeeService.employeeToken()
    this.userData$ = this._employeeService.getEmployee(token.id)
    this.enquiries$ = this.enquiryService.totalEnquiries()
    this.loading()
    this.dateCategories()
    this.getChartDetails()
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  loading() {
    this.subscriptions.add(
      this.enquiries$.subscribe((data) => {
        if (data) {
          this.isLoading = false
        }
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

  getChartDetails() {
    this.subscriptions.add(
      this.enquiryService.monthlyEnquiries().subscribe((data) => {
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
  }
}
