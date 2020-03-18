import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '@core/services';
import { Tax, StoreDocto } from '@app/_models';
import { ArrayValidators } from '@app/validators';
import { CustomerService, ProductService, CompanyService, TaxService, SalesService, RolesService, StoresService, DocumentService } from "@app/services";
import { Generic } from '@app/_models';
import { FormBuilder, Validators, FormControl, FormArray, FormGroup } from '@angular/forms';
import { formatDate } from '@angular/common';
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';

import * as cloneDeep  from 'lodash/cloneDeep';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { delay, map, shareReplay } from 'rxjs/operators';

import { MatTable } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {

  @ViewChild(MatTable, {static: false}) productsTable :MatTable<any>;

  taxes: Tax[]=[];
  onError: string='';
  loading: boolean=false;
  minDeliveryDate = new Date();

  invoiceDate: Date = new Date();
  customerId: string='';
  companyId: string = '';
  storeId: string ='';
  userId: string = '';
  country: string = '';
  dispLoading: boolean;
  cash: string='';
  step: number=1;
  filteredCustomers: Observable<Generic[]>;
  subsItems: Subscription;
  access$: Observable<any>;
  stores$: Observable<StoreDocto[]>;

  ingresado: string='';
  lineNo: number=0;
  index: number=0;

  displayedColumns = ['ToGo', 'Name', 'Unit_Price', 'Qty', 'Discount', 'Delivery_Date', 'Tax_Id', 'Actions'];
  selection = new SelectionModel<any>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = (<FormArray>this.salesForm.get('detail')).length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      const item = (<FormArray>this.salesForm.get('detail'));
      for (let i = 0; i < item.length; i++) {
        item.at(i).patchValue({'ToGo': 0});
      }
    } else {
      this.salesForm.get('detail').value.forEach(row => {
        this.selection.select(row);
      });
      const item = (<FormArray>this.salesForm.get('detail'));
      for (let i = 0; i < item.length; i++) {
        item.at(i).patchValue({'ToGo': 1});
      }
    }
  }

  get fSales(){
    return this.salesForm.controls;
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private customerService: CustomerService,
    private doctoService: DocumentService,
    private taxeService: TaxService,
    private salesService: SalesService,
    private authService: AuthService,
    private productService: ProductService,
    private companyService: CompanyService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver,
    private roleService: RolesService,
    private router: Router
  ) { }

  salesForm = this.fb.group({
    Invoice_Date: [formatDate(this.invoiceDate, 'yyyy-MM-dd hh:mm:ss', 'en-US'), Validators.required],
    Document_Id: ['', Validators.required], //b01238a0371e11eaa2531603e958f2e9
    Company_Id: ['', Validators.required],
    Status: [1, Validators.required],
    User_Id: [''],
    Payment_Status: ['', Validators.required],  //1 -- PAGADO CONTADO, 2 -- PAGADO TARJETA CREDITO, 3 -- CREDITO
    Payment_Date: ['', Validators.required],
    Total: [0],
    Total_Taxes: [0],
    Total_Discount: [0],
    Store_Id: ['', Validators.required], //135557c3371e11eaa2531603e958f2e9
    customerInfo: new FormControl(''),
    detail: this.fb.array([this.createDetail()], ArrayValidators.minLength(1))
  });

  createDetail(): FormGroup {
    const itemsDet = this.fb.group({
      Line_No: [0],
      Product_Id: [''],
      Name: ['', [Validators.required]],
      Tax_Id: ['', [Validators.required]],
      Percentage: [0],
      Include_Tax: [0],
      Qty: [0, [Validators.required, Validators.max(99999999.9990), Validators.min(0.0001), Validators.maxLength(13)]],
      Unit_Price: [0, [Validators.required, Validators.max(99999999.90), Validators.min(0.01), Validators.maxLength(11)]],
      ToGo: [0],
      Discount: [0, [Validators.max(99999999.90), Validators.min(0.00), Validators.maxLength(11)]],
      Total: [0],
      Total_Tax: [0],
      Delivery_Date: [''],
      Type: [''],
      Actions: ['']
    });
    this.subsItems = itemsDet.valueChanges
      .subscribe(data => this.onValueChanged(data));

    return itemsDet;
  }

  onValueChanged(data?: any): void {
    data['Qty'] = +data['Qty'];
    data['Unit_Price'] = +data['Unit_Price'];
    data['Total'] = +data['Qty']*data['Unit_Price'];
    data['Discount'] = +data['Discount'];
    if (data['ToGo'] === false || data['ToGo'] === 0) { data['ToGo'] = 0; } else { data['ToGo'] = 1; }
    if (data['Include_Tax'] === 0) {
      data['Total_Tax'] = +((data['Total']-data['Discount'])*(data['Percentage']/100)).toFixed(2);
      data['Total'] = +(data['Total']-data['Discount'])+data['Total_Tax'];
    } else {
      data['Total_Tax'] = +((data['Total']-data['Discount'])-((data['Total']-data['Discount'])/(1+(data['Percentage']/100)))).toFixed(2);
    }
    //UPDATE GRAND TOTAL
    this.calcGrandTotal();
  }

  ngOnInit() {
    let isAdmin = this.authService.isAdmin();
    let roleId = this.authService.roleId();
    if (roleId != '' && isAdmin != 1){
      this.access$ = this.roleService.getAccess(roleId, 'Sales').pipe(
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
      this.initData();
    }
  }

  initData(){
    this.companyId = this.authService.companyId();
    this.userId = this.authService.userId();
    this.storeId = ''; // this.authService.storeId();

    if (this.storeId === '' || this.storeId === undefined){
      this.stores$ = this.doctoService.getDoctosCompany(this.companyId);
    }

    let data = "companyId=" + this.companyId + "&currPage=1&perPage=20";
    this.taxeService.getTaxes(data).subscribe((res: any) => {
      if (res != null){
        this.taxes = res.taxes;
      }
    },
    error => {
      this.openDialog('Error !', error.Message, false, true, false);
    });

    this.companyService.getCompany(this.companyId).subscribe((res: any) => {
      if (res != null) {
        this.country = res.Country;
        if (this.country === 'DEU'){
          this.displayedColumns = ['ToGo', 'Name', 'Unit_Price', 'Qty', 'Discount', 'Delivery_Date', 'Actions'];
        } else {
          this.displayedColumns = ['Name', 'Unit_Price', 'Qty', 'Discount', 'Delivery_Date', 'Tax_Id', 'Actions'];
        }
      }
    },
    error => { 
      this.openDialog('Error !', error.Message, false, true, false);
    });

    this.salesForm.controls['User_Id'].setValue(this.userId);
    this.salesForm.controls['Company_Id'].setValue(this.companyId);
  }

  getProducts(storeId: string){
    
  }

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

  getErrorMessage(component: string, index: number) {
    if (component === 'Unit_Price'){
      let unitPrice = (<FormArray>this.salesForm.get('detail')).controls[index].get('Unit_Price');
      return unitPrice.hasError('required') ? 'You must enter a value' :
        unitPrice.hasError('min') ? 'Minimun value 0.01' :
          unitPrice.hasError('max') ? 'Maximun value 99999999.90':
            unitPrice.hasError('pattern') ? 'Incorrect value':
                '';
    }
    if (component === 'Quantity'){
      let qty = (<FormArray>this.salesForm.get('detail')).controls[index].get('Qty');
      return qty.hasError('required') ? 'You must enter a value' :
        qty.hasError('min') ? 'Minimun value 0.0001' :
          qty.hasError('max') ? 'Maximun value 99999999.9990':
            qty.hasError('pattern') ? 'Incorrect value':
                '';
    }
    if (component === 'Discount'){
      let disc = (<FormArray>this.salesForm.get('detail')).controls[index].get('Discount');
      return disc.hasError('min') ? 'Minimun value 0.00' :
        disc.hasError('max') ? 'Maximun value 99999999.90':
          disc.hasError('pattern') ? 'Incorrect value':
                '';
    }
  }

  productSelected(product: any) {
    this.productService.getProduct(product.P_Id).subscribe((res: any) => {
      if (res != null) {
        const item = this.salesForm.controls.detail as FormArray;
        let values = this.taxes.filter(res => res.To_Go == false);
        let unitValue = res.Unit_Price;
        if (res.Type === 'services' && product.Unit != '') {
          unitValue = +product.Unit;
        }
        if (this.lineNo == 0) {
          this.lineNo = 1;
          this.index = 0;
        } else {
          //ADD NEW ROW AT THE END
          (<FormArray>this.salesForm.get('detail')).push(this.createDetail());

          this.lineNo += 1;
          this.index += 1;
        }
        let totalTax: number;
        let total: number;
        let percentage: number;
        percentage = values[0].Percentage;
        total = +product.Qty*unitValue.toFixed(2);
        if (values[0].Include_Tax == false){
          totalTax = +((total-0)*(percentage/100)).toFixed(2);
          total = +(total-0)+totalTax;
        } else {
          totalTax = +((total-0)-((total-0)/(1+(percentage/100)))).toFixed(2);
        }
        item.at(this.index).setValue({
          'Line_No': this.lineNo,
          'Product_Id': res.Product_Id,
          'Name': res.Name,
          'Unit_Price': +unitValue.toFixed(2),
          'Qty': +product.Qty,
          'Discount': 0,
          'ToGo': 0,
          'Tax_Id': values[0].Tax_Id,
          'Percentage': percentage,
          'Include_Tax': values[0].Include_Tax,
          'Total': total,
          'Total_Tax': totalTax,
          'Type': res.Type,
          'Delivery_Date': '',
          'Actions':''
        }); 
        //UPDATE GRAND TOTAL
        this.calcGrandTotal();

        this._snackBar.open('Product added successful', 'Close', {
          duration: 2000,
          panelClass: 'style-succes'
        });
      }
    },
    error => { 
      this.openDialog('Error !', error.Message, false, true, false);
    });
  }

  onSubmit(){
    if (this.salesForm.invalid) {
      return;
    }
    this.loading = true;
    let form = cloneDeep(this.salesForm);
    let nameCustomer: string = '';

    if (typeof form.get('customerInfo').value.Name === 'string'){
      nameCustomer = form.get('customerInfo').value.Name;
    } else {
      nameCustomer = form.get('customerInfo').value.Name.Name;
    }
    let dataForm =  { 
      "Document_Id": form.value.Document_Id,
      "Customer_Id": form.get('customerInfo').value.Customer_Id,
      "Name": nameCustomer,
      "Invoice_Date": form.value.Invoice_Date,
      "Tax_Number": form.get('customerInfo').value.Tax_Number,
      "Is_Exent": form.get('customerInfo').value.Is_Exent,
      "Reason": form.get('customerInfo').value.Reason,
      "Payment_Status": form.value.Payment_Status,
      "Payment_Auth": '',
      "Payment_Date": form.value.Payment_Date,
      "User_Id": form.value.User_Id,
      "Company_Id": form.value.Company_Id,
      "Total": form.value.Total,
      "Total_Taxes": form.value.Total_Taxes,
      "Total_Discount": form.value.Total_Discount,
      "Store_Id": form.value.Store_Id,
      "detail": []
    }
    
    let lines = form.value.detail;
    // .filter(x => x.Added == 1);
    // for (let i = 0; i < lines.length; i++) {
    //   delete lines[i].Added;
    // }
    dataForm['detail'] = lines;
    this.salesService.postSale(dataForm)
      .subscribe(
        response =>  {
          this.loading = false;
          this.openDialog('Sales', 'Sales created successful', true, false, false);
          this.salesForm.reset({'Invoice_Date':formatDate(this.invoiceDate, 'yyyy-MM-dd hh:mm:ss', 'en-US'), 'Document_Id': 'b01238a0371e11eaa2531603e958f2e9', 'Company_Id': this.companyId, 'Status': 1, 'User_Id': this.userId, 'Payment_Status': '', 'Payment_Date': '', 'Total': 0, 'Total_Taxes': 0, 'Total_Discount':0, 'Store_Id':'135557c3371e11eaa2531603e958f2e9', 'customerInfo': '', 'detail': this.fb.array([], ArrayValidators.minLength(1)) });
          this.lineNo = 0;
          this.step = 1;
          this.cash = '';
          (<FormArray>this.salesForm.get('detail')).clear(); 
          (<FormArray>this.salesForm.get('detail')).push(this.createDetail());
        },
        error => { 
          this.loading = false;
          this.openDialog('Error !', error.Message, false, true, false);
        }
      );
  }

  removeItem(index){
    (<FormArray>this.salesForm.get('detail')).removeAt(index);
    this.productsTable.renderRows();

    const item = (<FormArray>this.salesForm.get('detail'));
    this.lineNo = 1;
    for (let i = 0; i < item.length; i++) {
      item.at(i).patchValue({'Line_No': this.lineNo});
      this.lineNo += 1;
    }
    this.lineNo -= 1;
    this.index -= 1;

    this.calcGrandTotal();

    if (this.salesForm.get('Total').value <= 0) {
      this.step = 1;
      this._snackBar.open('You must select one item', 'Close', {
        duration: 2000,
        panelClass: 'style-error'
      });
    }
  }

  calcGrandTotal(){
    const item = (<FormArray>this.salesForm.get('detail'))
    let grandTotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    for (let i = 0; i < item.length; i++) {
      grandTotal += +item.at(i).value.Total;
      totalTax += +item.at(i).value.Total_Tax;
      totalDiscount += +item.at(i).value.Discount;
    }
    this.salesForm.controls['Total'].setValue(grandTotal);
    this.salesForm.controls['Total_Taxes'].setValue(totalTax);
    this.salesForm.controls['Total_Discount'].setValue(totalDiscount);
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

  pressKey(value){
    if (value === 'AC') {
      this.ingresado = '0';
    } else {
      this.ingresado = this.ingresado + value;
    }
  }

  paymentMethod(value){
    this.cash = value;
    if (this.cash === 'cash'){
      const todayDate = new Date();
      const payDate = formatDate(todayDate, 'yyyy-MM-dd hh:mm:ss', 'en-US');

      this.salesForm.controls['Payment_Status'].setValue(1);
      this.salesForm.controls['Payment_Date'].setValue(payDate);
    } else {
      this.salesForm.controls['Payment_Status'].setValue(2);
    }
  }

  changeTax(event, index){
    const item = (<FormArray>this.salesForm.get('detail'));
    let values = this.taxes.filter(res => res.Tax_Id == event.value); 
    item.at(index).patchValue({'Tax_Id': values[0].Tax_Id, 'Percentage':values[0].Percentage, 'Include_Tax': values[0].Include_Tax});
  }

  setTax(event, index){
    const item = (<FormArray>this.salesForm.get('detail'));
    if (event.checked === true){
      let values = this.taxes.filter(res => res.To_Go == true); 
      item.at(index).patchValue({'Tax_Id': values[0].Tax_Id, 'Percentage':values[0].Percentage, 'Include_Tax': values[0].Include_Tax});
    } else{
      let values = this.taxes.filter(res => res.To_Go == false); 
      item.at(index).patchValue({'Tax_Id': values[0].Tax_Id, 'Percentage':values[0].Percentage, 'Include_Tax': values[0].Include_Tax});
    }
  }

  setStep(event){
    if (this.salesForm.get('Total').value > 0) {
      this.step = event;
    } else {
      this._snackBar.open('You must select one item', 'Close', {
        duration: 2000,
        panelClass: 'style-error'
      });
    }
  }

  displayLoading(event){
    if (event === 'display') {
      setTimeout(() => {
        delay(50);
        this.loading = true;
      });
    } else {
      this.loading = false;
    }
  }

  ngOnDestroy() {
    this.subsItems.unsubscribe();
  }
}
