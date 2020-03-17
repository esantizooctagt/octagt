import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '@core/services';
import { Tax } from '@app/_models';
import { TaxService } from "@app/services";
import { MonitorService } from "@shared/monitor.service";
import { delay } from 'q';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';

@Component({
  selector: 'app-tax-list',
  templateUrl: './tax-list.component.html',
  styleUrls: ['./tax-list.component.scss']
})
export class TaxListComponent implements OnInit {

  @Output() taxSelected = new EventEmitter<Tax>();
  // @Output() modLoading = new EventEmitter<string>();
  public length: number = 0;
  public pageSize: number = 10;
  public taxes: Tax[] = [];
  public pages: number[];
  public listView:boolean=true;
  public onError: string='';

  private _currentPage: number = 1;
  private _currentSearchValue: string = '';

  companyId: string = '';
  message: string;
  lastTax: Tax;
  deleted: boolean = false;
  displayYesNo: boolean = false;
  deletingTax: boolean = false;
  message$: Observable<string>;
  deleteTax$: Observable<any>;
  taxes$: Observable<Tax[]>;

  constructor(
    private authService: AuthService,
    private data: MonitorService,
    private taxService: TaxService,
    private spinnerService: SpinnerService,
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
    // this.modLoading.emit('display');
    this.companyId = this.authService.companyId();
    this.loadTaxes(this._currentPage, this.pageSize, this._currentSearchValue);
    this.message$ = this.data.monitorMessage.pipe(
      map(res => {
        this.message = 'init';
        if (res === 'taxes') {
          this.message = res;
          this.loadTaxes(this._currentPage, this.pageSize, this._currentSearchValue);
        }
        return this.message;
      })
    );
  }
  
  loadTaxes(crPage, crNumber, crValue) {
    this.onError = '';
    var spinnerRef = this.spinnerService.start("Loading Taxes...");
    let data = "companyId=" + this.companyId + "&currPage=" + (crValue === '' ? crPage : 1) + "&perPage=" + crNumber + (crValue === '' ? '' : '&searchValue=' + crValue);

    this.taxes$ = this.taxService.getTaxes(data).pipe(
      map((res: any) => {
        if (res != null) {
          this.pages = Array(res.pagesTotal.pages).fill(0).map((x, i) => i);
          this.length = res.pagesTotal.count;
          // this.modLoading.emit('none');
          this.spinnerService.stop(spinnerRef);
        }
        return res.taxes;
      }),
      catchError(err => {
        this.onError = err.Message;
        // this.modLoading.emit('none');
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  public filterList(searchParam: string): void {
    this._currentSearchValue = searchParam;
    this.loadTaxes(
      this._currentPage,
      this.pageSize,
      this._currentSearchValue
    );
  }

  onSelect(tax: Tax) {
    if (this.lastTax != tax){
      this.taxSelected.emit(tax);
      this.lastTax = tax;
    } else {
      let defTax: Tax;
      (async () => {
        this.taxSelected.emit(defTax);
        await delay(20);
        this.taxSelected.emit(tax);
      })();
    }
    window.scroll(0,0);
  }

  onDelete(tax: Tax) {
    this.displayYesNo = true;

    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: 'Tax', 
      message: 'Are you sure to delete this Tax?', 
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
        var spinnerRef = this.spinnerService.start("Deleting Tax...");
        if (this.deleted){
          let delTax: Tax;
          this.deleted = false; 
          this.deleteTax$ = this.taxService.deleteTax(tax.Tax_Id).pipe(
            tap(res => {
              this.taxSelected.emit(delTax);
              this.spinnerService.stop(spinnerRef);
              this.displayYesNo = false;
              this.deletingTax = true;
              this.loadTaxes(
                this._currentPage,
                this.pageSize,
                this._currentSearchValue
              );
              this.openDialog('Tax', 'Tax deleted successful', true, false, false);
              window.scroll(0,0);
            }),
            catchError(err => {
              this.deletingTax = false;
              this.spinnerService.stop(spinnerRef);
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
    this.loadTaxes(
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

  trackById(index: number, item: Tax) {
    return item.Tax_Id;
  }
}
