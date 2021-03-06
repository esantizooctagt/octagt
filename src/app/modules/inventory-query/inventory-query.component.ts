import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { AuthService } from '@core/services';
import { Product, Currency } from '@app/_models';
import { environment } from '@environments/environment';
import { ProductService, RolesService } from '@app/services';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SpinnerService } from '@app/shared/spinner.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventory-query',
  templateUrl: './inventory-query.component.html',
  styleUrls: ['./inventory-query.component.scss']
})
export class InventoryQueryComponent implements OnInit {
  @Output() newStep = new EventEmitter<string>();
  
  products$: Observable<Product[]>;
  access$: Observable<any>;

  public length: number = 0;
  public pageSize: number = 10;
  public products: Product[] = [];
  public pages: number[];
  public onError: string='';
  public bucketURL = environment.bucket;
  public checkOut: boolean=false;

  private _currentPage: number = 1;
  private _currentSearchValue: string = '';

  companyId: string = '';
  currencyCompany: string ='';

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private spinnerService: SpinnerService,
    private roleService: RolesService,
    private router: Router,
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

  async ngOnInit() {
    let isAdmin = this.authService.isAdmin();
    let roleId = this.authService.roleId();
    if (roleId != '' && isAdmin != 1){
      this.access$ = await this.roleService.getAccess(roleId, 'Query Inventory').pipe(
        map(res => {
          if (res != null){
            if (res.Value === 0){
              this.router.navigate(['/']);
            } else {
              this.initData();
            }
          }
        })
      );
    } else {
      this.initData()
    }
  }

  initData(){
    this.companyId = this.authService.companyId();
    this.currencyCompany = this.authService.currency();
    this.loadProducts(this._currentPage, this.pageSize, this._currentSearchValue);
  }

  loadProducts(crPage, crNumber, crValue){
    this.onError = '';
    var spinnerRef = this.spinnerService.start("Loading Products..."); 
    let data = this.companyId + "/" + (crValue === '' ? crPage : 1) + "/" + crNumber + '/_' + (crValue === '' ? '/_' : '/' + crValue);

    this.products$ = this.productService.getProducts(data).pipe(
      map((res: any) => {
        if (res != null) {
          this.pages = Array(res.pagesTotal.pages).fill(0).map((x, i) => i);
          this.length = res.pagesTotal.count;
          // this.modLoading.emit('none');
        }
        this.spinnerService.stop(spinnerRef);
        return res.products;
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        // this.modLoading.emit('none');
        return this.onError;
      })
    );
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

  public filterList(searchParam: string) {
    this._currentSearchValue = searchParam;
    this.loadProducts(
      this._currentPage,
      this.pageSize,
      this._currentSearchValue
    );
  }

  public sendStep(event){
    this.newStep.emit( event );
  }

  trackById(index: number, item: Product) {
    return item.Product_Id;
  }

}
