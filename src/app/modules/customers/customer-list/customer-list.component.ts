import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '@core/services';
import { Customer } from '@app/_models';
import { CustomerService } from "@app/services";
import { MonitorService } from "@shared/monitor.service";
import { AlertService  } from "@shared/alert";

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {

  @Output() childEvent = new EventEmitter<Customer>();
  public totalRows: number = 0;
  public itemsNumber: number = 1;
  public customers: Customer[] = [];
  public pages: number[];

  private _currentPage: number = 1;
  private _currentSearchValue: string = '';

  companyId: string = '';
  message:string;

  constructor(
    private authService: AuthService,
    private data: MonitorService,
    private customerService: CustomerService,
    private alertService: AlertService 
  ) { }

  ngOnInit() {
    this.companyId = this.authService.companyId();
    this.loadCustomers(this._currentPage, this.itemsNumber, this._currentSearchValue);
    this.data.monitorMessage
        .subscribe((message: any) => {
          if (message === 'change') {
            this.message = message;
            this.loadCustomers(this._currentPage, this.itemsNumber, this._currentSearchValue);
          } 
        });
  }
  
  loadCustomers(crPage, crNumber, crValue){
    this.customerService.getCustomers(this.companyId, crPage, crNumber, crValue).subscribe((res: any) => {
      if (res != null) {
        this.customers = res.customers;
        this.pages = Array(res.pagesTotal.pages).fill(0).map((x,i)=>i);
        this.totalRows = res.pagesTotal.count;
      }
    },
    error => {
      this.alertService.error('Error ! ' + error);
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
    this.childEvent.emit(customer);
  }

  onDelete(customer: Customer){
    let tokenValue = this.authService.currentToken();
    this.customerService.deleteCustomer(customer.Customer_Id, tokenValue).subscribe(
      response =>  {
        this.loadCustomers(
          this._currentPage,
          this.itemsNumber,
          this._currentSearchValue
        );
        this.alertService.success('Customer deleted successful');
      },
      error => {
        this.alertService.error('Error ! ' + error);
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
  
  public onChangeNumber(elements: number){
    this.itemsNumber = elements;
    this._currentPage = 1;
    this.loadCustomers(
      this._currentPage,
      this.itemsNumber,
      this._currentSearchValue
    );
  }

}
