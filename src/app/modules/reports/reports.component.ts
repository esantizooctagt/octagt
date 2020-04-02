import { Component, OnInit } from '@angular/core';
import { ReportsService } from '@app/services';
import { AuthService } from '@app/core/services';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  companyId: string='';
  cashierday$: Observable<any[]>;
  displayedColumns: string[] = ['No', 'Total', 'Net_Total', 'Total_Taxes', 'Status', 'Cashier', 'Store'];

  constructor(
    private authService: AuthService,
    private reportService: ReportsService
  ) { }

  ngOnInit() {
    this.companyId = this.authService.companyId();

    this.cashierday$ = this.reportService.getCashierDay(this.companyId);
  }

}
