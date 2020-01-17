import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '@core/services';
import { Customer } from '@app/_models';
import { CustomerService } from "@app/services";
import { MonitorService } from "@shared/monitor.service";
import { AlertService  } from "@shared/alert";
import { delay } from 'q';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {

  @Output() childEvent = new EventEmitter<Customer>();
  public totalRows: number = 0;
  public itemsNumber: number = 10;
  public customers: Customer[] = [];
  public pages: number[];
  public listView:boolean=false;
  public onError: string='';

  private _currentPage: number = 1;
  private _currentSearchValue: string = '';

  companyId: string = '';
  message:string;
  loading = false;
  spinner: string = '';
  dispLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private data: MonitorService,
    private customerService: CustomerService,
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
      this.loadCustomers(this._currentPage, this.itemsNumber, this._currentSearchValue);
      this.data.monitorMessage
        .subscribe((message: any) => {
          if (message === 'customers') {
            this.message = message;
            this.loadCustomers(this._currentPage, this.itemsNumber, this._currentSearchValue);
          }
        });
    })();
  }
  
  loadCustomers(crPage, crNumber, crValue){
    this.onError = '';
    let data = "companyId=" + this.companyId + "&currPage=" + crPage + "&perPage=" + crNumber + (crValue === '' ? '' : '&searchValue=' + crValue);

    this.customerService.getCustomers(data).subscribe((res: any) => {
      if (res != null) {
        this.customers = res.customers;
        this.pages = Array(res.pagesTotal.pages).fill(0).map((x,i)=>i);
        this.totalRows = res.pagesTotal.count;
        this.dispLoading = false;
      }
    },
    error => {
      this.onError = error.Message;
      this.dispLoading = false;
    });
  }

  public filterList(searchParam: string): void {
    this._currentSearchValue = searchParam;
    this.loadCustomers(
      this._currentPage,
      this.itemsNumber,
      this._currentSearchValue
    );
  }

  onSelect(customer: Customer){
    this.spinner = 'spin_sel_'+customer.Customer_Id;
    this.loading = true;
    this.childEvent.emit(customer);
    this.loading = false;
    this.spinner = '';
    window.scroll(0,0);
  }

  onDelete(customer: Customer){
    this.spinner = 'spin_del_'+customer.Customer_Id;
    this.loading = true;
    this.customerService.deleteCustomer(customer.Customer_Id).subscribe(
      response =>  {
        this.loadCustomers(
          this._currentPage,
          this.itemsNumber,
          this._currentSearchValue
        );
        this.loading = false;
        this.spinner = '';
        this.alertService.success('Product deleted successful');
      },
      error => {
        this.loading = false;
        this.spinner = '';
        this.alertService.error('Error ! ' + error.Message);
      });
  }

  public goToPage(page: number): void {
    this._currentPage = page;
    this.loadCustomers(
      this._currentPage,
      this.itemsNumber,
      this._currentSearchValue
    );
  }
  
  public setView(value){
    this.listView = value;
  }
  
  public onChangeNumber(elements: number){
    this.itemsNumber = elements;
    this._currentPage = 1;
    this.loadCustomers(
      this._currentPage,
      this.itemsNumber,
      this._currentSearchValue
    );
  }

  trackById(index: number, item: Customer) {
    return item.Customer_Id;
  }
}
