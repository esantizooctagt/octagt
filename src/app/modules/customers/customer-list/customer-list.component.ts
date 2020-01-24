import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '@core/services';
import { Customer } from '@app/_models';
import { CustomerService } from "@app/services";
import { MonitorService } from "@shared/monitor.service";
import { AlertService  } from "@shared/alert";
import { delay } from 'q';
import { environment } from '@environments/environment';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {

  @Output() childEvent = new EventEmitter<Customer>();
  public length: number = 0;
  public pageSize: number = 10;
  public customers: Customer[] = [];
  public pages: number[];
  public listView:boolean=false;
  public onError: string='';

  private _currentPage: number = 1;
  private _currentSearchValue: string = '';

  companyId: string = '';
  message:string;
  loading = false;
  dispLoading: boolean = false;
  lastCustomer: Customer;
  deleted: boolean = false;
  displayYesNo: boolean = false;

  constructor(
    private authService: AuthService,
    private data: MonitorService,
    private customerService: CustomerService,
    private dialog: MatDialog
  ) { }

  openDialog(header: string, message: string, success: boolean, error: boolean, warn: boolean): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: header, 
      message: message, 
      success: success, 
      error: error, 
      warn: warn
    };
    dialogConfig.width ='280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';

    this.dialog.open(DialogComponent, dialogConfig);
  }

  ngOnInit() {
    (async () => {
      this.dispLoading = true;
      // Do something before delay
      console.log('before delay')
      await delay(50);
      // Do something after
      console.log('after delay')
      this.companyId = this.authService.companyId();
      this.loadCustomers(this._currentPage, this.pageSize, this._currentSearchValue);
      this.data.monitorMessage
        .subscribe((message: any) => {
          if (message === 'customers') {
            this.message = message;
            this.loadCustomers(this._currentPage, this.pageSize, this._currentSearchValue);
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
        this.length = res.pagesTotal.count;
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
      this.pageSize,
      this._currentSearchValue
    );
  }

  onSelect(customer: Customer){
    if (this.lastCustomer != customer){
      this.childEvent.emit(customer);
      this.lastCustomer = customer;
    } else {
      let defCustomer: Customer;
      (async () => {
        this.childEvent.emit(defCustomer);
        await delay(20);
        this.childEvent.emit(customer);
      })();
    }
    window.scroll(0,0);
  }

  onDelete(customer: Customer){
    this.displayYesNo = true;

    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: 'Customer', 
      message: 'Are you sure to delete this Customer?', 
      success: false, 
      error: false, 
      warn: false,
      ask: this.displayYesNo
    };
    dialogConfig.width ='280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined){
        this.deleted = result;
        if (this.deleted){
          let delCustomer: Customer;
          this.loading = true;
          this.customerService.deleteCustomer(customer.Customer_Id).subscribe(
            response =>  {
              this.childEvent.emit(delCustomer);
              this.loadCustomers(
                this._currentPage,
                this.pageSize,
                this._currentSearchValue
              );
              this.loading = false;
              window.scroll(0,0);
              this.displayYesNo = false;
              this.openDialog('Customer', 'Customer deleted successful', true, false, false);
            },
            error => {
              this.loading = false;
              this.displayYesNo = false;
              this.openDialog('Error ! ', error.Message, false, true, false);
            });
        }
      }
    });
  }

  public goToPage(page: number, elements: number): void {
    if (this.pageSize != elements){
      this.pageSize = elements;
      this._currentPage = 1;
    } else {
      this._currentPage = page+1;
    }
    this.loadCustomers(
      this._currentPage,
      this.pageSize,
      this._currentSearchValue
    );
  }
  
  public setView(value){
    this.listView = value;
  }

  trackById(index: number, item: Customer) {
    return item.Customer_Id;
  }
}
