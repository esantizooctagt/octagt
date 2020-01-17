import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AuthService } from '@core/services';
import { Product } from '@app/_models';
import { ProductService } from "@app/services";
import { MonitorService } from "@shared/monitor.service";
import { AlertService  } from "@shared/alert";
import { delay } from 'q';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  @Input() view: string='';
  @Output() childEvent = new EventEmitter<Product>();
  public totalRows: number = 0;
  public itemsNumber: number = 10;
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
  spinner: string = '';
  dispLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private data: MonitorService,
    private productService: ProductService,
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
      this.loadProducts(this._currentPage, this.itemsNumber, this._currentSearchValue);
      this.data.monitorMessage
        .subscribe((message: any) => {
          if (message === 'products') {
            this.message = message;
            this.loadProducts(this._currentPage, this.itemsNumber, this._currentSearchValue);
          }
        });
    })();
  }
  
  loadProducts(crPage, crNumber, crValue){
    this.onError = '';
    let data = "companyId=" + this.companyId + "&currPage=" + crPage + "&perPage=" + crNumber + (crValue === '' ? '' : '&searchValue=' + crValue);

    this.productService.getProducts(data).subscribe((res: any) => {
      if (res != null) {
        this.products = res.products;
        this.pages = Array(res.pagesTotal.pages).fill(0).map((x,i)=>i);
        this.totalRows = res.pagesTotal.count;
        this.dispLoading = false;
      }
    },
    error => {
      // this.alertService.error('Error ! ' + error);
      // this.alertService.error('Error ! ' + error.Message);
      this.onError = error.Message;
      this.dispLoading = false;
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
    this.spinner = 'spin_sel_'+product.Product_Id;
    this.loading = true;
    this.childEvent.emit(product);
    this.loading = false;
    this.spinner = '';
    window.scroll(0,0);
  }

  onDelete(product: Product){
    this.spinner = 'spin_del_'+product.Product_Id;
    this.loading = true;
    this.productService.deleteProduct(product.Product_Id).subscribe(
      response =>  {
        this.loadProducts(
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
    this.loadProducts(
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
    this.loadProducts(
      this._currentPage,
      this.itemsNumber,
      this._currentSearchValue
    );
  }

  trackById(index: number, item: Product) {
    return item.Product_Id;
  }
}
