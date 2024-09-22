import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HomeRoutingModule } from 'src/app/modules/home/home-routing.module';
import * as echarts from 'echarts';

@Component({
  selector: 'app-half-doughnut-chart',
  standalone: true,
  imports: [HomeRoutingModule],
  templateUrl: './half-doughnut-chart.component.html',
  styleUrls: ['./half-doughnut-chart.component.css']
})
export class HalfDoughnutChartComponent implements OnInit {

  @ViewChild('halfDoughnutChart', { static: true }) halfDoughnutChart!: ElementRef;

  ngOnInit(): void {
    let option = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '5%',
        left: 'center'
      },
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: ['40%', '80%'],
          center: ['50%', '80%'],
          // adjust the start and end angle
          startAngle: 180,
          endAngle: 360,
          data: [
            { value: 1048, name: 'Search Engine' },
            { value: 735, name: 'Direct' },
            { value: 580, name: 'Email' },
          ]
        }
      ]
    };

    const myChart = echarts.init(this.halfDoughnutChart.nativeElement);
    myChart.setOption(option);
  }
}
