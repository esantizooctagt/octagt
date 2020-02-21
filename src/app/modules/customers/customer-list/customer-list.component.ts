import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '@core/services';
import { Customer } from '@app/_models';
import { CustomerService } from "@app/services";
import { MonitorService } from "@shared/monitor.service";
import { delay } from 'q';
import { environment } from '@environments/environment';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { map, catchError, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {

  @Output() customerSelected = new EventEmitter<Customer>();
  @Output() modLoading = new EventEmitter<string>();

  public length: number = 0;
  public pageSize: number = 10;
  public customers: Customer[] = [];
  public pages: number[];
  public listView:boolean=true;
  public onError: string='';

  private _currentPage: number = 1;
  private _currentSearchValue: string = '';

  companyId: string = '';
  message:string;
  loading = false;
  lastCustomer: Customer;
  deleted: boolean = false;
  displayYesNo: boolean = false;
  message$: Observable<string>;
  customers$: Observable<Customer[]>;
  deleteCustomer$: Observable<any>;
  deletingCustomer: boolean =false;
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
    this.modLoading.emit('display');
    this.companyId = this.authService.companyId();
    this.loadCustomers(this._currentPage, this.pageSize, this._currentSearchValue);
    this.message$ = this.data.monitorMessage.pipe(
      map(res => {
        this.message = 'init';
        if (res === 'customers') {
          this.message = res;
          this.loadCustomers(this._currentPage, this.pageSize, this._currentSearchValue);
        }
        return this.message;
      })
    );
  }
  
  loadCustomers(crPage, crNumber, crValue){
    this.onError = '';
    let data = "companyId=" + this.companyId + "&currPage=" + (crValue === '' ? crPage : 1) + "&perPage=" + crNumber + (crValue === '' ? '' : '&searchValue=' + crValue);

    this.customers$ = this.customerService.getCustomers(data).pipe(
      map((res: any) => {
        if (res != null) {
          this.pages = Array(res.pagesTotal.pages).fill(0).map((x, i) => i);
          this.length = res.pagesTotal.count;
          this.modLoading.emit('none');
        }
        return res.customers;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.modLoading.emit('none');
        return this.onError;
      })
    );
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
      this.customerSelected.emit(customer);
      this.lastCustomer = customer;
    } else {
      let defCustomer: Customer;
      (async () => {
        this.customerSelected.emit(defCustomer);
        await delay(20);
        this.customerSelected.emit(customer);
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
          this.deleteCustomer$ = this.customerService.deleteCustomer(customer.Customer_Id).pipe(
            tap(res => {
              this.customerSelected.emit(delCustomer);
              this.loading = false;
              this.displayYesNo = false;
              this.deletingCustomer = true;
              this.loadCustomers(
                this._currentPage,
                this.pageSize,
                this._currentSearchValue
              );
              this.openDialog('Customer', 'Customer deleted successful', true, false, false);
              window.scroll(0,0);
            }),
            catchError(err => {
              this.deletingCustomer = false;
              this.loading = false;
              this.displayYesNo = false;
              this.openDialog('Error ! ', err.Message, false, true, false);
              return throwError (err || err.message);
            })
          );
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
    if (value === 'list'){
      this.listView = true;
    } else {
      this.listView = false;
    }
  }

  trackById(index: number, item: Customer) {
    return item.Customer_Id;
  }
}
