import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AuthService } from '@core/services';
import { Tax } from '@app/_models';
import { TaxService } from "@app/services";
import { MonitorService } from "@shared/monitor.service";
import { AlertService  } from "@shared/alert";
// import { SearchComponent } from '@shared/search/search.component';
// import { PaginationComponent } from '@shared/pagination/pagination.component';

@Component({
  selector: 'app-tax-list',
  templateUrl: './tax-list.component.html',
  styleUrls: ['./tax-list.component.css']
})
export class TaxListComponent implements OnInit {

  @Output() childEvent = new EventEmitter<Tax>();
  public totalRows: number = 0;
  public itemsNumber: number = 1;
  public taxes: Tax[] = [];
  public pages: number[];
  // public page: number = 0;

  private _currentPage: number = 1;
  private _currentSearchValue: string = '';

  companyId: string = '';
  message:string;

  constructor(
    private authService: AuthService,
    private data: MonitorService,
    private taxService: TaxService,
    private alertService: AlertService 
  ) { }

  ngOnInit() {
    this.companyId = this.authService.companyId();
    this.loadTaxes(this._currentPage, this.itemsNumber, this._currentSearchValue);
    this.data.monitorMessage
      .subscribe((message: any) => {
        if (message === 'change') {
          this.message = message;
          this.loadTaxes(this._currentPage, this.itemsNumber, this._currentSearchValue);
        } 
      });
  }
  
  loadTaxes(crPage, crNumber, crValue){
    this.taxService.getTaxes(this.companyId, crPage, crNumber, crValue).subscribe((res: any) => {
      if (res != null) {
        this.taxes = res.taxes;
        this.pages = Array(res.pagesTotal.pages).fill(0).map((x,i)=>i);
        // this.page = res.pagesTotal.page;
        this.totalRows = res.pagesTotal.count;
      }
    },
    error => {
      this.alertService.error('Error ! ' + error);
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

  onSelect(tax: Tax){
    this.childEvent.emit(tax);
    //to send parameters between components
    // this.router.navigate(['/taxes', tax.Tax_Id]);
  }

  onDelete(tax: Tax){
    let tokenValue = this.authService.currentToken();
    this.taxService.deleteTax(tax.Tax_Id, tokenValue).subscribe(
      response =>  {
        this.loadTaxes(
          this._currentPage,
          this.itemsNumber,
          this._currentSearchValue
        );
        this.alertService.success('Tax deleted successful');
      },
      error => {
        this.alertService.error('Error ! ' + error);
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
  
  public onChangeNumber(elements: number){
    this.itemsNumber = elements;
    this._currentPage = 1;
    this.loadTaxes(
      this._currentPage,
      this.itemsNumber,
      this._currentSearchValue
    );
  }
}
