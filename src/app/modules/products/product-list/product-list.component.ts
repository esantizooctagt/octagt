import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AuthService } from '@core/services';
import { Product, Currency, StoreDocto, Cashier } from '@app/_models';
import { ProductService, DocumentService, CashiersService } from "@app/services";
import { MonitorService } from "@shared/monitor.service";
import { delay } from 'q';
import { environment } from '@environments/environment';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmValidParentMatcher } from '@app/validators';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { map, catchError, tap, first, filter } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { SpinnerService } from '@app/shared/spinner.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  @Input() view: string='';
  @Input() cashier: string='';
  @Output() productSelected = new EventEmitter<Product>();
  @Output() newStep = new EventEmitter<string>();
  @Output() addItem = new EventEmitter<Product>();
  @Output() storeSelected = new EventEmitter<string>();
  @Output() cashierSelected = new EventEmitter<string>();
  @Output() doctoSelected = new EventEmitter<string>();

  stores$: Observable<StoreDocto[]>;
  cashiers$: Observable<Cashier[]>;
  
  public length: number = 0;
  public pageSize: number = 10;
  public storeId: string='';
  public cashierId: string = '';
  public products: Product[] = [];
  public pages: number[];
  public listView:boolean=false;
  public onError: string='';
  public bucketURL = environment.bucket;

  private _currentPage: number = 1;
  private _currentSearchValue: string = '';

  companyId: string = '';
  message:string;
  lastProd: Product;
  deleted: boolean = false;
  displayYesNo: boolean = false;
  checkOut: boolean = false;
  currencyValue: Currency[]=[{"n":"Q", "c":"GTQ"},{"n":"EUR", "c":"EUR"}];
  currencyCompany: string ='';
  message$: Observable<string>;
  products$: Observable<Product[]>;
  deleteProduct$: Observable<any>;
  deletingProduct: boolean=false;

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private authService: AuthService,
    private data: MonitorService,
    private productService: ProductService,
    private spinnerService: SpinnerService,
    private cashierService: CashiersService,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
    private doctoService: DocumentService
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
    this.companyId = this.authService.companyId();
    this.storeId = this.authService.storeId();
    if (this.storeId === '' || this.storeId === undefined) {
      this.stores$ = this.doctoService.getDoctosCompany(this.companyId).pipe(
        map((res: any) => {
          if (res.length > 0){
            this.storeSelected.emit(res[0].StoreId);
            this.doctoSelected.emit(res[0].DocumentId);
            this.storeId = res[0].StoreId;
            this.loadProducts(this._currentPage, this.pageSize, this._currentSearchValue, this.storeId);
            if (this.view === "salesView"){
              this.cashiers$ = this.cashierService.getCashiersStore(this.storeId);
              if (this.cashier != ''){
                this.cashierId = this.cashier;
                this.checkOut = true;
              }
            }
          }
          return res;
        })
      )
    } else {
      this.loadProducts(this._currentPage, this.pageSize, this._currentSearchValue, this.storeId);
      this.stores$ = this.doctoService.getDoctosCompany(this.companyId).pipe(
        map(res => { return res.filter(store => store.StoreId === this.storeId); }),
        map((res: any )=> {
          this.storeSelected.emit(this.storeId);
          this.doctoSelected.emit(res[0].DocumentId);
          if (this.view === "salesView"){
            this.cashiers$ = this.cashierService.getCashiersStore(this.storeId);
            if (this.cashier != ''){
              this.cashierId = this.cashier;
              this.checkOut = true;
            }
          }
          return res;
        })
      );
    }

    let currencyId = this.authService.currency();
    let currencyVal: Currency[];
    currencyVal = this.currencyValue.filter(currency => currency.c.indexOf(currencyId) === 0);
    this.currencyCompany = currencyVal[0].n;
    
    this.message$ = this.data.monitorMessage.pipe(
      map(res => {
        this.message = 'init';
        if (res === 'products') {
          this.message = res;
          this.loadProducts(this._currentPage, this.pageSize, this._currentSearchValue, this.storeId);
        }
        return this.message;
      })
    ); 
  }

  loadProducts(crPage, crNumber, crValue, crStoreId){
    this.onError = '';
    var spinnerRef = this.spinnerService.start("Loading Products...");
    let data = this.companyId + "/" + (crValue === '' ? crPage : 1) + "/" + crNumber + "/" + crStoreId + (crValue === '' ? '/_' : '/' + crValue);

    this.products$ = this.productService.getProducts(data).pipe(
      map((res: any) => {
        if (res != null) {
          this.pages = Array(res.pagesTotal.pages).fill(0).map((x, i) => i);
          this.length = res.pagesTotal.count;
          this.spinnerService.stop(spinnerRef);
        }
        return res.products;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  getProducts(store: string){
    this.storeId = store;
    this.cashiers$ = this.cashierService.getCashiersStore(this.storeId);
    this.stores$.forEach((next: any) => {
      next.forEach(element => {
        if (element.StoreId === this.storeId){
          this.storeSelected.emit(this.storeId);
          this.doctoSelected.emit(element.DocumentId);
        }
      });
    })

    this.loadProducts(
      this._currentPage,
      this.pageSize,
      '',
      store
    );
  }

  setCashier(cashier: string){
    this.cashierSelected.emit(cashier);
    this.checkOut = true;
  }

  public filterList(searchParam: string) {
    this._currentSearchValue = searchParam;
    this.loadProducts(
      this._currentPage,
      this.pageSize,
      this._currentSearchValue,
      this.storeId
    );
  }

  onSelect(product: Product){
    if (this.lastProd != product){
      this.productSelected.emit(product);
      this.lastProd = product;
    } else {
      let defProd: Product;
      (async () => {
        this.productSelected.emit(defProd);
        await delay(20);
        this.productSelected.emit(product);
      })();
    }
    if (!this.view) { window.scroll(0,0) };
  }

  onAddItem(product: Product, qtyField: string, unitPriceField: string, i: number){
    let qty = (<HTMLInputElement>document.getElementById(qtyField)).value;
    let unitPrice = (<HTMLInputElement>document.getElementById(unitPriceField));
    let unitValue = 0;

    if (unitPrice != null){
      unitValue = +(<HTMLInputElement>document.getElementById(unitPriceField)).value;
    }
    if (qty === '') { qty = '1.00';}

    if (product.Stores.length > 0){
      if (+qty > product.Stores[0].Qty) { 
        this._snackBar.open('Qty must be less than ' + product.Stores[0].Qty, 'Close', {
          duration: 2000,
          panelClass: 'style-error'
        });
        (<HTMLInputElement>document.getElementById(qtyField)).value = "";
        if (unitValue > 0) { (<HTMLInputElement>document.getElementById(unitPriceField)).value = ""; }
        
        const prod: Product = {'Product_Id': '', 'Company_Id': '', 'SKU': '', 'Name': '', 'Unit_Price':0, 'Img_Path': '', 'Type': '', 'Status': 0, 'Qty': 0, 'Unit': 0, 'Stores': []};
        this.addItem.emit(prod);
        return;
      }
    }
    
    if (this.lastProd != product){
      product.Qty = +qty;
      product.Unit = +unitValue;
      this.addItem.emit(product);
      this.lastProd = product;
      (<HTMLInputElement>document.getElementById(qtyField)).value = "";
      if (unitValue > 0) { (<HTMLInputElement>document.getElementById(unitPriceField)).value = ""; }
    } else {
      (async () => {
        const prod: Product = {'Product_Id': '', 'Company_Id': '', 'SKU': '', 'Name': '', 'Unit_Price':0, 'Img_Path': '', 'Type': '', 'Status': 0, 'Qty': 0, 'Unit': 0, 'Stores': []};
        this.addItem.emit(prod);
        await delay(20);

        product.Qty = +qty;
        product.Unit = +unitValue;
        this.addItem.emit(product);
        (<HTMLInputElement>document.getElementById(qtyField)).value = "";
        if (unitValue > 0) { (<HTMLInputElement>document.getElementById(unitPriceField)).value = ""; }
      })();
    }
    if (!this.view) { window.scroll(0,0) };
  }

  onDelete(product: Product){
    this.displayYesNo = true;

    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: 'Product', 
      message: 'Are you sure to delete this Product?', 
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
        var spinnerRef = this.spinnerService.start("Deleting Product...");
        this.deleted = result;
        if (this.deleted){
          let delProd: Product;
          this.deleteProduct$ = this.productService.deleteProduct(product.Product_Id).pipe(
            tap(res => {
              this.productSelected.emit(delProd);
              this.spinnerService.stop(spinnerRef);
              this.displayYesNo = false;
              this.deletingProduct = true;
              this.loadProducts(
                this._currentPage,
                this.pageSize,
                this._currentSearchValue,
                this.storeId
              );
              this.openDialog('Product', 'Product deleted successful', true, false, false);
              window.scroll(0,0);
            }),
            catchError(err => {
              this.deletingProduct = false;
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
    this.loadProducts(
      this._currentPage,
      this.pageSize,
      this._currentSearchValue,
      this.storeId
    );
  }
  
  public setView(value){
    if (value === 'list'){
      this.listView = true;
    } else {
      this.listView = false;
    }
  }

  public sendStep(event){
    this.newStep.emit(event);
  }

  trackById(index: number, item: Product) {
    return item.Product_Id;
  }

  onKeyPress(event, value): boolean { 
    const charCode = (event.which) ? event.which : event.keyCode;
    let perc: string = value.toString();
    var count = (perc.match(/[.]/g) || []).length;
    if (count  == 1) {
      if (charCode == 46) return false;
    }
    if (charCode == 46) return true;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

}
