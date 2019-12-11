import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '@core/services';
import { Product } from '@app/_models';
import { ProductService } from "@app/services";
import { MonitorService } from "@shared/monitor.service";
import { AlertService  } from "@shared/alert";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  @Output() childEvent = new EventEmitter<Product>();
  public totalRows: number = 0;
  public itemsNumber: number = 1;
  public products: Product[] = [];
  public pages: number[];

  private _currentPage: number = 1;
  private _currentSearchValue: string = '';

  companyId: string = '';
  message:string;

  constructor(
    private authService: AuthService,
    private data: MonitorService,
    private productService: ProductService,
    private alertService: AlertService 
  ) { }

  ngOnInit() {
    this.companyId = this.authService.companyId();
    this.loadProducts(this._currentPage, this.itemsNumber, this._currentSearchValue);
    this.data.monitorMessage
        .subscribe((message: any) => {
          if (message === 'change') {
            this.message = message;
            this.loadProducts(this._currentPage, this.itemsNumber, this._currentSearchValue);
          } 
        });
  }
  
  loadProducts(crPage, crNumber, crValue){
    this.productService.getProducts(this.companyId, crPage, crNumber, crValue).subscribe((res: any) => {
      if (res != null) {
        this.products = res.products;
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
    this.loadProducts(
      this._currentPage,
      this.itemsNumber,
      this._currentSearchValue
    );
  }

  onSelect(product: Product){
    this.childEvent.emit(product);
  }

  onDelete(product: Product){
    let tokenValue = this.authService.currentToken();
    this.productService.deleteProduct(product.Product_Id, tokenValue).subscribe(
      response =>  {
        this.loadProducts(
          this._currentPage,
          this.itemsNumber,
          this._currentSearchValue
        );
        this.alertService.success('Product deleted successful');
      },
      error => {
        this.alertService.error('Error ! ' + error);
      });
  }

  public goToPage(page: number): void {
    this._currentPage = page;
    this.loadProducts(
      this._currentPage,
      this.itemsNumber,
      this._currentSearchValue
    );
  }
  
  public onChangeNumber(elements: number){
    this.itemsNumber = elements;
    this._currentPage = 1;
    this.loadProducts(
      this._currentPage,
      this.itemsNumber,
      this._currentSearchValue
    );
  }

}
