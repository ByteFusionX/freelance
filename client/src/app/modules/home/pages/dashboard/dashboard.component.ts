import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartOptions } from './dashboard.chart';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // @ViewChild("chart") chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;

  ngOnInit(): void {
    this.chartDetails()   
  }

  // generateData(baseval: any, count: any, yrange: any) {
  //   var i = 0;
  //   var series = [];
  //   while (i < count) {
  //     var x = Math.floor(Math.random() * (750 - 1 + 1)) + 1;
  //     var y =
  //       Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
  //     var z = Math.floor(Math.random() * (75 - 15 + 1)) + 15;

  //     series.push([x, y, z]);
  //     baseval += 86400000;
  //     i++;
  //   }
  //   return series;
  // }

  chartDetails(){
    this.chartOptions = {
      series: [
        {
          name: "ICT",
          data: [6, 11, 17, 22, 36, 40, 48, 53, 64, 71, 89, 95]
        },
        {
          name: "Security System",
          data: [10, 14, 27, 31, 34, 50, 57, 69, 78, 81, 84, 98]
        },
        {
          name: "Distribution",
          data: [5, 9, 16, 19, 23, 38, 42, 45, 61, 74, 87, 92]
        }
      ],
      chart: {
        height: 350,
        type: "area",
        toolbar: {
          show: false,
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
        categories: [
          "2023-01-01",
          "2023-02-01",
          "2023-03-01",
          "2023-04-01",
          "2023-05-01",
          "2023-06-01",
          "2023-07-01",
          "2023-08-01",
          "2023-09-01",
          "2023-010-01",
          "2023-011-01",
          "2023-012-01",
        ]
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      }
    };
  }
}
