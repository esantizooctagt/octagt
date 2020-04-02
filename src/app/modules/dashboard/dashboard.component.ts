import { Component, OnInit } from '@angular/core';
import { ReportsService } from '@app/services';
import { AuthService } from '@app/core/services';

import { graphic } from 'echarts';

declare const require: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  options: any;
  updateOptions: any;
  detectEventChanges = true;
  companyId: string='';
  currency: string='';

  private oneDay = 24 * 3600 * 1000;
  private now: Date;
  private value: number ;
  private data: any[];
  private timer: any;

  constructor(
    private authService: AuthService,
    private reportService: ReportsService
  ) { }

  ngOnInit() {
    this.companyId = this.authService.companyId();
    this.currency = this.authService.currency();
    let dataAxis = []; // ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
    let data = []; // [220, 182, 191, 234, 290, 330, 310, 123, 442, 321, 90, 149, 210, 122, 133, 334, 198, 123, 125, 220];
    let yMax = 500;
    let dataShadow = [];

    this.reportService.getSalesbyDay(this.companyId).subscribe(res => {
      if (res != null){
        let maxVal = 0;
        res.forEach(element => {
          if (element.StoreId == ''){
            dataAxis.push(element.Day);
            data.push(element.Sale);
            if (maxVal < element.Sale){
              maxVal = element.Sale;
            }
          }
        });

        yMax = maxVal;
        // for (let i = 0; i < data.length; i++) {
        //   dataShadow.push(yMax);
        // }

        this.options = {
          title: {
            text: 'Sales by Day in ' + this.currency
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            data: dataAxis,
            axisLabel: {
              inside: true,
              textStyle: {
                color: '#fff'
              }
            },
            axisTick: {
              show: false
            },
            axisLine: {
              show: false
            },
            z: 10
          },
          yAxis: {
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              textStyle: {
                color: '#999'
              }
            }
          },
          dataZoom: [
            {
              type: 'inside'
            }
          ],
          series: [
            { // For shadow
              type: 'bar',
              itemStyle: {
                normal: { color: 'rgba(0,0,0,0.05)' }
              },
              barGap: '-100%',
              barCategoryGap: '40%',
              data: dataShadow,
              animation: false
            },
            {
              type: 'bar',
              itemStyle: {
                normal: {
                  color: '#3398DB',
                  // new graphic.LinearGradient(
                  //   0, 0, 0, 1,
                  //   [
                  //     { offset: 0, color: '#83bff6' },
                  //     { offset: 0.5, color: '#188df0' },
                  //     { offset: 1, color: '#188df0' }
                  //   ]
                  // )
                },
                emphasis: {
                  color: '#3398DB',
                  // color: new graphic.LinearGradient(
                  //   0, 0, 0, 1,
                  //   [
                  //     { offset: 0, color: '#2378f7' },
                  //     { offset: 0.7, color: '#2378f7' },
                  //     { offset: 1, color: '#83bff6' }
                  //   ]
                  // )
                }
              },
              data: data
            }
          ]
        };
      }
    });

    // generate some random testing data:
    // this.data = [];
    // this.now = new Date(1997, 9, 3);
    // this.value = Math.random() * 1000;

    // for (let i = 0; i < 1000; i++) {
    //   this.data.push(this.randomData());
    // }

    // // initialize chart options:
    // this.options = {
    //   title: {
    //     text: 'Dynamic Data + Time Axis'
    //   },
    //   tooltip: {
    //     trigger: 'axis',
    //     formatter: (params) => {
    //       params = params[0];
    //       const date = new Date(params.name);
    //       return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
    //     },
    //     axisPointer: {
    //       animation: false
    //     }
    //   },
    //   xAxis: {
    //     type: 'time',
    //     splitLine: {
    //       show: false
    //     }
    //   },
    //   yAxis: {
    //     type: 'value',
    //     boundaryGap: [0, '100%'],
    //     splitLine: {
    //       show: false
    //     }
    //   },
    //   series: [{
    //     name: 'Mocking Data',
    //     type: 'line',
    //     showSymbol: false,
    //     hoverAnimation: false,
    //     data: this.data
    //   }]
    // };

    // // Mock dynamic data:
    // this.timer = setInterval(() => {
    //   for (let i = 0; i < 5; i++) {
    //     this.data.shift();
    //     this.data.push(this.randomData());
    //   }

    //   // update series data:
    //   this.updateOptions = {
    //     series: [{
    //       data: this.data
    //     }]
    //   };
    // }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  // onChartEvent(event: any, type: string) {
  //   console.log('chart event:', type, event);
  // }

  // randomData() {
  //   this.now = new Date(this.now.getTime() + this.oneDay);
  //   this.value = this.value + Math.random() * 21 - 10;
  //   return {
  //     name: this.now.toString(),
  //     value: [
  //       [this.now.getFullYear(), this.now.getMonth() + 1, this.now.getDate()].join('/'),
  //       Math.round(this.value)
  //     ]
  //   };
  // }

}
