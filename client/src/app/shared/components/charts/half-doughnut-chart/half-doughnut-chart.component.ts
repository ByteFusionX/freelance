import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { HomeRoutingModule } from 'src/app/modules/home/home-routing.module';
import * as echarts from 'echarts';
import { DashboardService } from 'src/app/core/services/dashboard.service';

@Component({
  selector: 'app-half-doughnut-chart',
  standalone: true,
  imports: [HomeRoutingModule],
  templateUrl: './half-doughnut-chart.component.html',
  styleUrls: ['./half-doughnut-chart.component.css']
})
export class HalfDoughnutChartComponent implements OnInit {
  @Input() conversionType!: string;
  @ViewChild('halfDoughnutChart', { static: true }) halfDoughnutChart!: ElementRef;

  constructor(private _dashboardService: DashboardService) { }

  ngOnInit(): void {
    const myChart = echarts.init(this.halfDoughnutChart.nativeElement);

    // Subscribe based on conversionType and update chart
    if (this.conversionType === 'direct') {
      this._dashboardService.enquiryConvesion$.subscribe((data) => {
        this.updateChart(myChart, data);
      });
    } else if (this.conversionType === 'presale') {
      this._dashboardService.presaleConvesion$.subscribe((data) => {
        this.updateChart(myChart, data);
      });
    }
  }

  private updateChart(chartInstance: echarts.ECharts, data: any): void {
    const option = {
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: ['40%', '80%'],
          center: ['50%', '80%'],
          startAngle: 180,
          endAngle: 360,
          color: ['#7C3AED', '#D3D3D3'],
          label: {
            show: true,
            fontSize: 20,
            position: 'center',
            formatter: function (value: number) {
              return data.total > 0 ? `${((data.converted / data.total) * 100).toFixed(0)}%` : '0%';
            },
          },
          labelLine: {
            show: true
          },
          data: [
            { value: data.converted || 0 },
            { value: data.total - data.converted || 0.1 },
          ]
        }
      ]
    };
    chartInstance.setOption(option);
  }
}