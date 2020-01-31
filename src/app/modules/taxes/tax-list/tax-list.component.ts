import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '@core/services';
import { Tax } from '@app/_models';
import { TaxService } from "@app/services";
import { MonitorService } from "@shared/monitor.service";
import { delay } from 'q';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';

@Component({
  selector: 'app-tax-list',
  templateUrl: './tax-list.component.html',
  styleUrls: ['./tax-list.component.scss']
})
export class TaxListComponent implements OnInit {

  @Output() childEvent = new EventEmitter<Tax>();
  @Output() modLoading = new EventEmitter<string>();
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
  loading = false;
  lastTax: Tax;
  deleted: boolean = false;
  displayYesNo: boolean = false;

  constructor(
    private authService: AuthService,
    private data: MonitorService,
    private taxService: TaxService,
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
    this.loadTaxes(this._currentPage, this.pageSize, this._currentSearchValue);
    this.data.monitorMessage
      .subscribe((message: any) => {
        if (message === 'taxes') {
          this.message = message;
          this.loadTaxes(this._currentPage, this.pageSize, this._currentSearchValue);
        }
      });
  }
  
  loadTaxes(crPage, crNumber, crValue) {
    this.onError = '';
    let data = "companyId=" + this.companyId + "&currPage=" + crPage + "&perPage=" + crNumber + (crValue === '' ? '' : '&searchValue=' + crValue);

    this.taxService.getTaxes(data).subscribe((res: any) => {
      if (res != null) {
        this.taxes = res.taxes;
        this.pages = Array(res.pagesTotal.pages).fill(0).map((x, i) => i);
        this.length = res.pagesTotal.count;
        this.modLoading.emit('none');
      }
    },
    error => {
      this.onError = error.Message;
      this.modLoading.emit('none');
    });
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
      this.childEvent.emit(tax);
      this.lastTax = tax;
    } else {
      let defTax: Tax;
      (async () => {
        this.childEvent.emit(defTax);
        await delay(20);
        this.childEvent.emit(tax);
      })();
    }
    window.scroll(0,0);
    //to send parameters between components
    // this.router.navigate(['/taxes', tax.Tax_Id]);
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
        if (this.deleted){
          let delTax: Tax;
          this.loading = true;
          this.deleted = false; 
          this.taxService.deleteTax(tax.Tax_Id).subscribe(
            response => {
              this.childEvent.emit(delTax);
              this.loadTaxes(
                this._currentPage,
                this.pageSize,
                this._currentSearchValue
              );
              this.loading = false;
              window.scroll(0,0);
              this.displayYesNo = false;
              this.openDialog('Tax', 'Tax deleted successful', true, false, false);
              // this._snackBar.open('Tax deleted successful', 'Close', {
              //   duration: 3000,
              //   panelClass: 'style-succes'
              // });
            },
            error => {
              this.loading = false;
              this.displayYesNo = false;
              this.openDialog('Error ! ', error.Message, false, true, false);
              // this._snackBar.open('Error ! ' + error.Message, 'Close', {
              //   duration: 3000,
              //   panelClass: 'style-error'
              // });
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
