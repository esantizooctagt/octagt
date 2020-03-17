import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '@app/core/services';
import { SalesService } from '@app/services';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SpinnerService } from '@app/shared/spinner.service';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
  private companyId: string = '';
  private storeId: string = '';

  public length: number = 0;
  public pageSize: number = 10;
  public listView: boolean = false;
  public onError: string = '';
  public invoices$: Observable<any>;
  public pages: number[];
  public loading: boolean = false;

  private _currentPage: number = 1;
  private _currentSearchValue: string = '';

  public displayedColumns = ['Invoice_Number', 'Invoice_Date', 'Name', 'Payment_Status', 'User_Name', 'Total_Taxes', 'Total', 'Store_Name', 'Actions'];

  constructor(
    private authService: AuthService,
    private salesService: SalesService,
    private spinnerService: SpinnerService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  get fData(){
    return this.salesForm.controls;
  }

  salesForm = this.fb.group({
    Invoice_Id: [''],
    Invoice_Number: [''],
    Invoice_Date: [''],
    Name: [''],
    Payment_Status: [''],
    User_Name: [''],
    Total: [0],
    Total_Taxes: [0],
    Store_Name: ['']
  });

  ngOnInit() {
    this.companyId = this.authService.companyId();
    this.storeId = this.authService.storeId();
    if (this.storeId === '' || this.storeId === undefined) {
      this.storeId = '';
    }
    this.loadInvoices(this._currentPage, this.pageSize, this._currentSearchValue);
  }

  public goToPage(page: number, elements: number): void {
    if (this.pageSize != elements){
      this.pageSize = elements;
      this._currentPage = 1;
    } else {
      this._currentPage = page+1;
    }
    this.loadInvoices(
      this._currentPage,
      this.pageSize,
      this._currentSearchValue
    );
  }

  loadInvoices(crPage, crNumber, crValue){
    this.onError = '';

    var spinnerRef = this.spinnerService.start("Loading Invoices...");
    let data = "companyId=" + this.companyId + "&currPage=" + (crValue === '' ? crPage : 1) + "&perPage=" + crNumber + (this.storeId === '' ? '' : '&storeId=' + this.storeId) + (crValue === '' ? '' : '&searchValue=' + crValue);
    this.invoices$ = this.salesService.getInvoices(data).pipe(
      map((res: any) => {
        if (res != null) {
          this.pages = Array(res.pagesTotal.pages).fill(0).map((x, i) => i);
          this.length = res.pagesTotal.count;
        }
        this.spinnerService.stop(spinnerRef);
        return res.sales;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  public filterList(searchParam: string) {
    this._currentSearchValue = searchParam;
    this.loadInvoices(
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

  goInvoice(invoiceId: string){
    this.router.navigate(['invoices/' + invoiceId]);
  }
}
