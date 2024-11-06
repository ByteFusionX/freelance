import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { HomeRoutingModule } from 'src/app/modules/home/home-routing.module';
import * as echarts from 'echarts';
import { DashboardService } from 'src/app/core/services/dashboard.service';

@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.css'],
  standalone: true,
  imports: [HomeRoutingModule],
})
export class DoughnutChartComponent implements AfterViewInit, AfterViewChecked {

  @ViewChild('doughnutChart', { static: true }) doughnutChart!: ElementRef;
  chartInstance: any;

  constructor(
    private _dashboardService:DashboardService
  ){}
<<<<<<< HEAD

  ngAfterViewInit(): void {
    this.initializeChart();
    this.makeChartResponsive();
  }

  ngAfterViewChecked(): void {
    this.onWindowResize()
  }

  initializeChart(): void {
    this.chartInstance = echarts.init(this.doughnutChart.nativeElement);
=======
  ngOnInit(): void {
    const myChart = echarts.init(this.doughnutChart.nativeElement);
    new ResizeObserver(() => myChart.resize()).observe(this.doughnutChart.nativeElement);
>>>>>>> 896f4633347e2d25acbea1dbf6c4a4334b63f2da

    this._dashboardService.donutChart$.subscribe((data)=>{
      let option = {
        tooltip: {
          trigger: 'item',
          formatter: function (params:any) {
            return `${params.name} : ${params.value} QAR`;
        }
        },
        series: [
          {
            name: 'Sales Person',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 40,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data
          }
        ]
      };      
  
      this.chartInstance.setOption(option);
    })
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    const screenWidth = window.innerWidth;
    switch (true) {
      case (screenWidth >= 1024 && screenWidth < 1280):
        this.chartResize({ width: 350, height: 230 });
        break;

      case (screenWidth >= 1280 && screenWidth < 1536):
        this.chartResize({ width: 400, height: 280 });
        break;

      case (screenWidth >= 1536 && screenWidth < 1600):
        this.chartResize({ width: 450, height: 300 });
        break;

      case (screenWidth >= 1600 && screenWidth < 1920):
        this.chartResize({ width: 500, height: 350 });
        break;

      case (screenWidth >= 1920 && screenWidth <= 2560):
        this.chartResize({ width: 550, height: 450 });
        break;

      case (screenWidth >= 2560):
        this.chartResize({ width: 600, height: 500 });
        break;

      default:
        this.chartResize({ width: 300, height: 200 });
        break;
    }
  }

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