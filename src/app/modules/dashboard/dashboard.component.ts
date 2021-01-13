import { Component, OnInit } from '@angular/core';
import { ReportsService } from '@app/services';
import { AuthService } from '@app/core/services';

import { SpinnerService } from '@app/shared/spinner.service';
import { graphic } from 'echarts';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  bars: Subscription;
  pie: Subscription;
  scalar: Subscription;

  salebyday: any;
  doctosbyday: any;
  topProducts: any;
  salesbymonth: any;

  detectEventChanges = true;
  companyId: string='';
  currency: string='';
  
  private timer: any;

  constructor(
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private reportService: ReportsService
  ) { }

  ngOnInit() {
    this.companyId = this.authService.companyId();
    this.currency = this.authService.currency();
    let dataAxis = [];
    let dataAxisPie = [];
    let dataAxisSales = [];

    let monthSales = [];
    let sales = [];
    let doctos = [];
    let prods = [];

    let yMax = 0;
    let yMaxDoctos = 0;
    let dataShadow = [];

    var spinnerRef = this.spinnerService.start("Loading Dashboard...");
    this.bars = this.reportService.getSalesbyDay(this.companyId).subscribe(res => {
      if (res != null){
        let maxVal = 0;
        let maxInvoice = 0;
        res.forEach(element => {
          if (element.StoreId == ''){
            dataAxis.push(element.Day);
            sales.push(element.Sale);
            doctos.push(element.Invoices);
            if (maxVal < element.Sale){
              maxVal = element.Sale;
            }
            if (maxInvoice < element.Invoices){
              maxInvoice = element.Invoices;
            }
          }
        });

        yMax = maxVal;
        yMaxDoctos = maxInvoice;

        this.salebyday = {
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
              inside: false,
              textStyle: {
                color: '#000'
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
                  color: '#092e66',
                },
                emphasis: {
                  color: '#abc6ff',
                }
              },
              data: sales
            }
          ]
        };

        this.doctosbyday = {
          title: {
            text: '# Documents by Day'
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
              inside: false,
              textStyle: {
                color: '#000'
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
                  color: '#abc6ff',
                },
                emphasis: {
                  color: '#092e66',
                }
              },
              data: doctos
            }
          ]
        };
      }
    });

    this.pie = this.reportService.getTopProducts(this.companyId).subscribe(res => {
      if (res != null){
        res.forEach(element => {
          dataAxisPie.push(element.Producto);
          prods.push({name: element.Producto, value: element.Qty});
        });
        this.topProducts = {
          title: {
            text: 'Top Products'
          },
          tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          // legend: {
          //     orient: 'vertical',
          //     left: 10,
          //     data: dataAxisPie
          // },
          series: [
            {
              name: 'Units',
              type: 'pie',
              radius: ['40%', '90%'],
              avoidLabelOverlap: false,
              label: {
                  show: false,
                  position: 'center'
              },
              emphasis: {
                  label: {
                      show: true,
                      fontSize: '30',
                      fontWeight: 'bold'
                  }
              },
              labelLine: {
                  show: false
              },
              data: prods
            }
          ]
        }
      }
    });

    this.scalar = this.reportService.getSalesByMonth(this.companyId).subscribe(res => {
      if (res != null){
        res.forEach(element => {
          dataAxisSales.push(element.Month);
          monthSales.push(element.Sales);
        });

        this.salesbymonth = {
          title: {
            text: 'Sales by Month ' + this.currency
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#092e66'
              }
            }
          },
          legend: {
            data: ['Sales by month']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: dataAxisSales
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: 'Sales by Month',
              type: 'line',
              stack: 'counts',
              areaStyle: { normal: {color: '#092e66'} },
              itemStyle: {
                normal: {
                  color: '#092e66',
                }
              },
              data: monthSales
            }
          ]
        }
        this.spinnerService.stop(spinnerRef);
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this.timer);
    if (this.bars){ this.bars.unsubscribe();}
    if (this.pie) { this.pie.unsubscribe();}
    if (this.scalar){ this.scalar.unsubscribe();}
  }

  // onChartEvent(event: any, type: string) {
  //   console.log('chart event:', type, event);
  // }
}
