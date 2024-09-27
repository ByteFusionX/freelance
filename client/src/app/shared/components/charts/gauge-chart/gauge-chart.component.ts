import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { HomeRoutingModule } from 'src/app/modules/home/home-routing.module';
import { NumberShortenerPipe } from 'src/app/shared/pipes/numberShortener.pipe';

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.css'],
  standalone: true,
  imports: [HomeRoutingModule, NumberShortenerPipe],
  providers: [NumberShortenerPipe]
})
export class GaugeChartComponent implements OnInit {

  @ViewChild('gaugeChart', { static: true }) gaugeChart!: ElementRef;

  constructor(
    private _dashboardService: DashboardService,
    private numberShortenerPipe: NumberShortenerPipe
  ) { }
  ngOnInit(): void {
    const myChart = echarts.init(this.gaugeChart.nativeElement);

    this._dashboardService.guageChart$.subscribe((report) => {
      console.log(report)
      console.log(new Date().getTime())
      let criticalRange = (report.badRange / report.targetValue)
      let moderateRange = (report.moderateRange / report.targetValue)
      let revenue = (report.companyRevenue / report.targetValue)

      const numberShortenerPipe = this.numberShortenerPipe;

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
            axisLine: {
              lineStyle: {
                width: 30,
                color: [
                  [criticalRange, '#FF6E76'],
                  [moderateRange, '#FDDD60'],
                  [1, '#7CFFB2']
                ]
              }
            },
            pointer: {
              icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
              length: '30%',
              width: 10,
              offsetCenter: [0, '-40%'],
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
              length: 10,
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
                console.log(value)
                if (value === 0) {
                  return '0';
                } else if (value.toFixed(1) === criticalRange.toFixed(1)) {
                  return numberShortenerPipe.transform(report.badRange); // Use pipe here
                } else if (value.toFixed(1) === moderateRange.toFixed(1)) {
                  return numberShortenerPipe.transform(report.moderateRange); // Use pipe here
                } else if (value === 1) {
                  return numberShortenerPipe.transform(report.targetValue); // Use pipe here
                }
                return '';
              }
            },
            title: {
              offsetCenter: [0, '20%'],
              fontSize: 12
            },
            detail: {
              fontSize: 20,
              offsetCenter: [0, '0%'],
              valueAnimation: true,
              formatter: function (value: number) {
                return report.companyRevenue.toFixed(2)
              },
              color: 'inherit'
            },
            data: [
              {
                value: revenue,
                name: 'Revenue Achieved'
              }
            ]
          }
        ]
      };

      console.log(option);
      myChart.setOption(option);
    })


  }

}
