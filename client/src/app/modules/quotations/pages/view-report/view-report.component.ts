import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { ChartOptions } from 'src/app/modules/home/pages/dashboard/dashboard.chart';
import { FilterQuote, PieChartOptions, Quotatation, QuoteStatus, QuoteStatusColors, ReportDetails } from 'src/app/shared/interfaces/quotation.interface';

@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.component.html',
  styleUrls: ['./view-report.component.css']
})
export class ViewReportComponent {
  reportData!:ReportDetails;
  public chartOptions!: Partial<PieChartOptions>;

  constructor(
    private dialogRef: MatDialogRef<ViewReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FilterQuote,
    private _quotationSerice:QuotationService
  ) { }

  ngOnInit(){
    this._quotationSerice.getQuotationReport(this.data).subscribe((res)=>{
      this.reportData = res;
      this.getPieChartDetails()
    })
  }

  getPieChartDetails(){
    this.chartDetails()
  }

  onClose() {
    this.dialogRef.close()
  }

  chartDetails() {
    this.chartOptions = {
      series: this.reportData.pieChartData.map(data => data.value),
      chart: {
        width: 380,
        type: 'pie',
      },
      labels: this.reportData.pieChartData.map(data => data.name),
      colors: this.reportData.pieChartData.map(data => QuoteStatusColors[data.name as QuoteStatus]),
      dataLabels: {
        enabled: true,
        formatter: (val: number) => {
          return ''; 
        },
        dropShadow: {
          enabled: false
        }
      },
      plotOptions: {
        pie: {
          dataLabels: {
            offset: -10
          }
        }
      },
      tooltip: {
        y: {
          formatter: (val: number) => {
            return val.toString(); 
          }
        }
      },
      legend: {
        show: true,
        position: 'right', 
        markers: {
          width: 12,
          height: 12
        },
        itemMargin: {
          horizontal: 5,
          vertical: 5
        },
        formatter: (seriesName: string, opts: any) => {
          const value = this.reportData.pieChartData.find(data => data.name === seriesName)?.value;
          return `${seriesName}: ${value}`; 
        }
      },
    };
    // this.showChart = true;
  }
}
