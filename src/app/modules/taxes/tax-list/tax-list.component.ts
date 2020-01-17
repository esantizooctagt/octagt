import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AuthService } from '@core/services';
import { Tax } from '@app/_models';
import { TaxService } from "@app/services";
import { MonitorService } from "@shared/monitor.service";
import { AlertService } from "@shared/alert";
import { delay } from 'q';

@Component({
  selector: 'app-tax-list',
  templateUrl: './tax-list.component.html',
  styleUrls: ['./tax-list.component.scss']
})
export class TaxListComponent implements OnInit {

  @Output() childEvent = new EventEmitter<Tax>();
  public totalRows: number = 0;
  public itemsNumber: number = 10;
  public taxes: Tax[] = [];
  public pages: number[];
  public listView:boolean=false;
  public onError: string='';

  private _currentPage: number = 1;
  private _currentSearchValue: string = '';

  companyId: string = '';
  message: string;
  dispLoading: boolean = false;
  loading = false;
  spinner = '';

  constructor(
    private authService: AuthService,
    private data: MonitorService,
    private taxService: TaxService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    (async () => {
      this.dispLoading = true;
      // Do something before delay
      console.log('before delay')
      await delay(50);
      // Do something after
      console.log('after delay')
      this.companyId = this.authService.companyId();
      this.loadTaxes(this._currentPage, this.itemsNumber, this._currentSearchValue);
      this.data.monitorMessage
        .subscribe((message: any) => {
          if (message === 'taxes') {
            this.message = message;
            this.loadTaxes(this._currentPage, this.itemsNumber, this._currentSearchValue);
          }
        });
    })();
  }

  loadTaxes(crPage, crNumber, crValue) {
    this.onError = '';
    let data = "companyId=" + this.companyId + "&currPage=" + crPage + "&perPage=" + crNumber + (crValue === '' ? '' : '&searchValue=' + crValue);

    this.taxService.getTaxes(data).subscribe((res: any) => {
      if (res != null) {
        this.taxes = res.taxes;
        this.pages = Array(res.pagesTotal.pages).fill(0).map((x, i) => i);
        this.totalRows = res.pagesTotal.count;
        this.dispLoading = false;
      }
    },
      error => {
        // this.alertService.error('Error ! ' + error.Message);
        this.onError = error.Message;
        this.dispLoading = false;
      });
  }

  public filterList(searchParam: string): void {
    this._currentSearchValue = searchParam;
    this.loadTaxes(
      this._currentPage,
      this.itemsNumber,
      this._currentSearchValue
    );
  }

  onSelect(tax: Tax) {
    this.spinner = 'spin_sel_'+tax.Tax_Id;
    this.loading = true;
    this.childEvent.emit(tax);
    this.loading = false;
    this.spinner = '';
    window.scroll(0,0);
    //to send parameters between components
    // this.router.navigate(['/taxes', tax.Tax_Id]);
  }

  onDelete(tax: Tax) {
    this.spinner = 'spin_del_'+tax.Tax_Id;
    this.loading = true;
    this.taxService.deleteTax(tax.Tax_Id).subscribe(
      response => {
        this.loadTaxes(
          this._currentPage,
          this.itemsNumber,
          this._currentSearchValue
        );
        this.loading = false;
        this.spinner = '';
        this.alertService.success('Tax deleted successful');
      },
      error => {
        this.loading = false;
        this.spinner = '';
        this.alertService.error('Error ! ' + error.Message);
      });
  }

  public goToPage(page: number): void {
    this._currentPage = page;
    this.loadTaxes(
      this._currentPage,
      this.itemsNumber,
      this._currentSearchValue
    );
  }

  public setView(value){
    this.listView = value;
  }

  public onChangeNumber(elements: number) {
    this.itemsNumber = elements;
    this._currentPage = 1;
    this.loadTaxes(
      this._currentPage,
      this.itemsNumber,
      this._currentSearchValue
    );
  }

  trackById(index: number, item: Tax) {
    return item.Tax_Id;
  }
}
