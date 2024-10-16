import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
export class DoughnutChartComponent implements OnInit {

  @ViewChild('doughnutChart', { static: true }) doughnutChart!: ElementRef;
  
  constructor(
    private _dashboardService:DashboardService
  ){}
  ngOnInit(): void {
    const myChart = echarts.init(this.doughnutChart.nativeElement);
    new ResizeObserver(() => myChart.resize()).observe(this.doughnutChart.nativeElement);

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
  
      myChart.setOption(option);
    })
    
  }

}

