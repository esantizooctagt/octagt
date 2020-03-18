import { Component, OnInit, ViewChild } from '@angular/core';
import { StoresService, ProductService, RolesService } from '@app/services';
import { AuthService } from '@app/core/services';
import { Observable, throwError } from 'rxjs';
import { StoreDocto, Product } from '@app/_models';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { ArrayValidators } from '@app/validators';
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable } from '@angular/material/table';
import { map, catchError, tap } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { SpinnerService } from '@app/shared/spinner.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {

  @ViewChild(MatTable) invTable :MatTable<any>;
  
  get f() { return this.inventoryForm.controls; }

  get Unit_Price(){
    return this.inventoryForm.get('Unit_Price');
  }
  get Qty(){
    return this.inventoryForm.get('Qty');
  }

  stores$: Observable<StoreDocto[]>;
  inventory$: Observable<any>;
  prods$: Observable<Product[]>;
  updProduct$: Observable<object>;
  
  onError: string ='';
  companyId: string = '';
  userId: string = '';
  displayForm: boolean = true;

  private _currentPage: number = 1;
  public length: number = 0;
  public pageSize: number = 10;
  public pages: number[];

  displayedColumns = ['SKU', 'Name', 'Unit_Price', 'Qty', 'Actions'];

  confirmValidParentMatcher = new ConfirmValidParentMatcher();
  
  constructor(
    private fb: FormBuilder,
    private storeService: StoresService,
    private productService: ProductService,
    private spinnerService: SpinnerService,
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) { }

  inventoryForm = this.fb.group({
    StoreId: ['', Validators.required],
    Detail: this.fb.array([this.createDetail()], ArrayValidators.minLength(1))
  })

  createDetail(): FormGroup {
    const itemsDet = this.fb.group({
      Product_Id: [''],
      SKU: [''],
      Name: [''],
      Unit_Price: [0, [Validators.required, Validators.max(99999999.90), Validators.min(0.01), Validators.maxLength(11), Validators.pattern("^[0-9]{0,8}\.?[0-9]{0,2}$")]], 
      Qty: [0, [Validators.required, Validators.max(99999999.9990), Validators.min(0.0001), Validators.maxLength(13), Validators.pattern("^[0-9]{0,8}\.?[0-9]{0,2}$")]]
    });
    return itemsDet;
  }

  openDialog(header: string, message: string, success: boolean, error: boolean, warn: boolean): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    // dialogConfig.disableClose = true;
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
      this.router.navigate(['/']);
    } else {
      this.initData()
    }
  }

  initData(){
    this.companyId = this.authService.companyId();
    this.userId = this.authService.userId();
    this.stores$ = this.storeService.getStoresDoctos(this.companyId);
  }

  getProducts(storeId: string){
    var spinnerRef = this.spinnerService.start("Loading Products...");
    this.prods$ = this.productService.getProductsStore(storeId, this._currentPage, this.pageSize, this.companyId).pipe(
      map((res: any) => {
        if (res != null) {
          this.pages = Array(res.pagesTotal.pages).fill(0).map((x, i) => i);
          this.length = res.pagesTotal.count;
        }
        this.spinnerService.stop(spinnerRef);
        return res.products;
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        return this.onError;
      })
    );
    this.inventoryForm.setControl('Detail', this.setExistingProds(this.prods$));
  }

  setExistingProds(prods: Observable<Product[]>){
    const formArray = new FormArray([]);
    var spinnerRef = this.spinnerService.start("Loading Products...");
    prods.forEach(res => {
      res.forEach(prod => {
        formArray.push(
          this.fb.group({
            Product_Id: prod.Product_Id,
            SKU: prod.SKU,
            Name: prod.Name,
            Unit_Price: prod.Unit_Price,
            Qty: prod.Qty,
            Actions: ''
          }));
          this.invTable.renderRows();
      });
      this.spinnerService.stop(spinnerRef);
    });
    return formArray;
  }

  updateItem(productId: string, qty: number, unitPrice: number){
    if (qty == undefined || qty < 0) { return; }
    if (unitPrice == undefined || unitPrice < 0) { return; }
    let prod = {
      Store_Id: this.inventoryForm.get('StoreId').value,
      Product_Id: productId,
      Qty: qty,
      Unit_Price: unitPrice
    }
    this.updProduct$ = this.productService.setInventory(prod).pipe(
      tap(res => {
        this._snackBar.open('Product updated successful', 'Close', {
          duration: 2000,
          panelClass: 'style-succes'
        });
      }),
      catchError(err => {
        this.openDialog('Error !', err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );

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

  public goToPage(page: number, elements: number): void {
    if (this.pageSize != elements){
      this.pageSize = elements;
      this._currentPage = 1;
    } else {
      this._currentPage = page+1;
    }
    this.prods$ = this.productService.getProductsStore(this.inventoryForm.get('StoreId').value, this._currentPage, this.pageSize, this.companyId).pipe(
      map((res: any) => {
        if (res != null) {
          this.pages = Array(res.pagesTotal.pages).fill(0).map((x, i) => i);
          this.length = res.pagesTotal.count;
        }
        return res.products;
      }),
      catchError(err => {
        this.onError = err.Message;
        return this.onError;
      })
    );
    this.inventoryForm.setControl('Detail', this.setExistingProds(this.prods$));
  }

}
