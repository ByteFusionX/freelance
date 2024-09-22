import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import { HomeRoutingModule } from 'src/app/modules/home/home-routing.module';

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.css'],
  standalone: true,
  imports: [HomeRoutingModule]
})
export class GaugeChartComponent implements OnInit {

  @ViewChild('gaugeChart', { static: true }) gaugeChart!: ElementRef;

  ngOnInit(): void {
    let option = {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          center: ['50%', '75%'],
          radius: '90%',
          min: 0,
          max: 1,
          splitNumber: 8,
          axisLine: {
            lineStyle: {
              width: 30,
              color: [
                [0.33, '#FF6E76'],
                [0.66, '#FDDD60'],
                [1, '#7CFFB2']
              ]
            }
          },
          pointer: {
            icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
            length: '50%',
            width: 10,
            offsetCenter: [0, '-20%'],
            itemStyle: {
              color: 'auto'
            }
          },
          axisTick: {
            length: 0,
            lineStyle: {
              color: 'auto',
              width: 0
            }
          },
          splitLine: {
            length: 0,
            lineStyle: {
              color: 'auto',
              width: 0
            }
          },
          axisLabel: {
            color: '#464646',
            fontSize: 12,
            distance: -30,
            rotate: 'tangential',
            formatter: function (value: number) {
              if (value === 0.875) {
                return 'End';
              } else if (value === 0.5) {
                return 'Middle';
              } else if (value === 0.125) {
                return 'Start';
              }
              return '';
            }
          },
          title: {
            offsetCenter: [0, '20%'],
            fontSize: 12
          },
          detail: {
            fontSize: 25,
            offsetCenter: [0, '0%'],
            valueAnimation: true,
            formatter: function (value: number) {
              return Math.round(value * 100) + '';
            },
            color: 'inherit'
          },
          data: [
            {
              value: 0.5,
              name: 'represents'
            }
          ]
        }
      ]
    };
    

    const myChart = echarts.init(this.gaugeChart.nativeElement);
    myChart.setOption(option);
  }

}
