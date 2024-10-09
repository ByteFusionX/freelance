import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HomeRoutingModule } from 'src/app/modules/home/home-routing.module';
import * as echarts from 'echarts';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { NumberShortenerPipe } from 'src/app/shared/pipes/numberShortener.pipe';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [HomeRoutingModule, NumberShortenerPipe],
  providers: [NumberShortenerPipe],
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {

  @ViewChild('lineChart', { static: true }) lineChart!: ElementRef;

  constructor(
    private _dashboardService: DashboardService,
    private numberShortenerPipe: NumberShortenerPipe
  ) { }
  ngOnInit(): void {
    const myChart = echarts.init(this.lineChart.nativeElement);

    this._dashboardService.graphChart$.subscribe((data) => {
      const numberShortenerPipe = this.numberShortenerPipe;
      const maxProfit = Math.max(...data.profitPerMonths.profits)
      let option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          valueFormatter: (value:any) => `${value.toFixed(2)} QAR`,
        },
        xAxis: {
          type: 'category',
          data: data.profitPerMonths.months
        },
        yAxis: {
          type: 'value',
          max: data.profitTarget.targetValue || 0 > maxProfit ? data.profitTarget.targetValue : maxProfit.toFixed(2),
          axisLabel: {
            formatter: function (value: number) {
              return numberShortenerPipe.transform(value)
            }
          },
        },
        series: [
          {
            data: data.profitPerMonths.profits,
            type: 'line',
            smooth: true,
            markArea: {
              data: [
                [
                  {

                    yAxis: '0',
                    itemStyle: {
                      color: '#FF7F7F',
                      opacity: 0.5
                    },
                  },
                  {
                    yAxis: data.profitTarget.criticalRange
                  }
                ],
                [
                  {

                    yAxis: data.profitTarget.criticalRange,
                    itemStyle: {
                      color: '#FFFF00',
                      opacity: 0.5
                    },
                  },
                  {
                    yAxis: data.profitTarget.moderateRange
                  }
                ],
                [
                  {

                    yAxis: data.profitTarget.moderateRange,
                    itemStyle: {
                      color: '#90EE90',
                      opacity: 0.5
                    },
                  },
                  {
                    yAxis: data.profitTarget.targetValue || 0 > maxProfit ? data.profitTarget.targetValue : maxProfit.toFixed(2)
                  }
                ],
              ]
            },
          }
        ]
      };

      myChart.setOption(option);
    })

  }
}
