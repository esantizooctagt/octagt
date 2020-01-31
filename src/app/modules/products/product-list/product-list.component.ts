import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AuthService } from '@core/services';
import { Product } from '@app/_models';
import { ProductService } from "@app/services";
import { MonitorService } from "@shared/monitor.service";
import { delay } from 'q';
import { environment } from '@environments/environment';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  @Input() view: string='';
  @Output() childEvent = new EventEmitter<Product>();
  @Output() newStep = new EventEmitter<string>();
  @Output() addItem = new EventEmitter<Object>();
  @Output() modLoading = new EventEmitter<string>();

  public length: number = 0;
  public pageSize: number = 10;
  public products: Product[] = [];
  public pages: number[];
  public listView:boolean=false;
  public onError: string='';
  public bucketURL = environment.bucket;

  private _currentPage: number = 1;
  private _currentSearchValue: string = '';

  companyId: string = '';
  message:string;
  loading = false;
  lastProd: Product;
  deleted: boolean = false;
  displayYesNo: boolean = false;
  checkOut: boolean = false;

  constructor(
    private authService: AuthService,
    private data: MonitorService,
    private productService: ProductService,
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
    this.loadProducts(this._currentPage, this.pageSize, this._currentSearchValue);
    this.data.monitorMessage
      .subscribe((message: any) => {
        if (message === 'products') {
          this.message = message;
          this.loadProducts(this._currentPage, this.pageSize, this._currentSearchValue);
        }
      });
      if (this.view === "salesView"){
        this.checkOut = true;
      }
  }
  
  loadProducts(crPage, crNumber, crValue){
    this.onError = '';
    let data = "companyId=" + this.companyId + "&currPage=" + crPage + "&perPage=" + crNumber + (crValue === '' ? '' : '&searchValue=' + crValue);

    this.productService.getProducts(data).subscribe((res: any) => {
      if (res != null) {
        this.products = res.products;
        this.pages = Array(res.pagesTotal.pages).fill(0).map((x,i)=>i);
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
    this.loadProducts(
      this._currentPage,
      this.pageSize,
      this._currentSearchValue
    );
  }

  onSelect(product: Product){
    if (this.lastProd != product){
      this.childEvent.emit(product);
      this.lastProd = product;
    } else {
      let defProd: Product;
      (async () => {
        this.childEvent.emit(defProd);
        await delay(20);
        this.childEvent.emit(product);
      })();
    }
    if (!this.view) { window.scroll(0,0) };
  }

  onAddItem(product: Product, qtyField: string, i: number){
    let qty = (<HTMLInputElement>document.getElementById(qtyField)).value;
    if (qty === '') { qty = '1.00';}
    if (this.lastProd != product){
      this.addItem.emit( { "P_Id": product.Product_Id, "Qty": qty.toString() } );
      this.lastProd = product;
      (<HTMLInputElement>document.getElementById(qtyField)).value = "";
    } else {
      (async () => {
        this.addItem.emit("{ 'P_Id': '', 'Qty': ''}");
        await delay(20);
        this.addItem.emit( { "P_Id": product.Product_Id, "Qty": qty.toString() } );
        (<HTMLInputElement>document.getElementById(qtyField)).value = "";
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
        this.deleted = result;
        if (this.deleted){
          let delProd: Product;
          this.loading = true;
          this.productService.deleteProduct(product.Product_Id).subscribe(
            response =>  {
              this.childEvent.emit(delProd);
              this.loadProducts(
                this._currentPage,
                this.pageSize,
                this._currentSearchValue
              );
              this.loading = false;
              window.scroll(0,0);
              this.displayYesNo = false;
              this.openDialog('Product', 'Product deleted successful', true, false, false);
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
    this.loadProducts(
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

  public sendStep(event){
    this.newStep.emit( event );
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
