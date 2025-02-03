import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
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
export class HalfDoughnutChartComponent implements AfterViewInit {

  @Input() conversionType!: string;
  @ViewChild('halfDoughnutChart', { static: true }) halfDoughnutChart!: ElementRef;
  chartInstance: any;

  constructor(private _dashboardService: DashboardService) { }

  ngAfterViewInit(): void {
    this.initializeChart();
    this.makeChartResponsive();
  }

  // ngAfterViewChecked(): void {
  //   this.onWindowResize()
  // }

  initializeChart(): void {
    this.chartInstance = echarts.init(this.halfDoughnutChart.nativeElement);

    // Subscribe based on conversionType and update chart
    if (this.conversionType === 'direct') {
      this._dashboardService.enquiryConvesion$.subscribe((data) => {
        this.updateChart(this.chartInstance, data);
      });
    } else if (this.conversionType === 'presale') {
      this._dashboardService.presaleConvesion$.subscribe((data) => {
        this.updateChart(this.chartInstance, data);
      });
    } else if (this.conversionType === 'reAssingedPresale') {
      this._dashboardService.reAssignedpresaleConvesion$.subscribe((data) => {
        this.updateChart(this.chartInstance, data);
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

  // @HostListener('window:resize', ['$event'])
  // onWindowResize(): void {
  //   const screenWidth = window.innerWidth;
  //   switch (true) {
  //     case (screenWidth >= 1024 && screenWidth < 1280):
  //       this.chartResize({ width: 350, height: 250 });
  //       break;

  //     case (screenWidth >= 1280 && screenWidth < 1536):
  //       this.chartResize({ width: 400, height: 300 });
  //       break;

  //     case (screenWidth >= 1536 && screenWidth < 1600):
  //       this.chartResize({ width: 450, height: 320 });
  //       break;

  //     case (screenWidth >= 1600 && screenWidth < 1920):
  //       this.chartResize({ width: 500, height: 350 });
  //       break;

  //     case (screenWidth >= 1920 && screenWidth <= 2560):
  //       this.chartResize({ width: 550, height: 450 });
  //       break;

  //     case (screenWidth >= 2560):
  //       this.chartResize({ width: 600, height: 500 });
  //       break;

  //     default:
  //       this.chartResize({ width: 300, height: 220 });
  //       break;
  //   }
  // }

  chartResize(size: any) {
    if (this.chartInstance) {
      this.chartInstance.resize(size);
    }
  }

  makeChartResponsive(): void {
    window.addEventListener('resize', () => {
      if (this.chartInstance) {
        this.chartInstance.resize();
      }
    });
  }
}