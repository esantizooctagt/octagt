import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '@core/services';
import { Tax, Product } from '@app/_models';
import { ArrayValidators } from '@app/validators';
import { CustomerService, TaxService, SalesService, RolesService, StoresService, CashiersService } from "@app/services";
import { Generic } from '@app/_models';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { formatDate } from '@angular/common';
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';

import * as cloneDeep  from 'lodash/cloneDeep';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, shareReplay, delay, tap, catchError, debounceTime, distinctUntilChanged, filter, switchMap, finalize } from 'rxjs/operators';

import { MatTable } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { SpinnerService } from '@app/shared/spinner.service';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  @ViewChild(MatTable) productsTable :MatTable<any>;
  onError: string='';
  minDeliveryDate = new Date();

  taxes: Tax[]=[];
  invoiceDate: Date = new Date();
  customerId: string='';
  companyId: string = '';
  storeId: string ='';
  doctoId: string='';
  cashierId: string='';
  userId: string = '';
  country: string = '';
  currency: string ='';
  userName: string='';
  invoiceNumber: string = '';
  paymentOpt: string='';
  step: number=1;
  savingSale: boolean = false;
  filteredCustomers: Observable<Generic[]>;
  subsItems: Subscription;
  access$: Observable<any>;
  taxes$: Observable<Tax[]>;
  storeInfo$: Observable<any>;
  salesDocto$: Observable<any>;
  setCashier$: Observable<any>;

  //customer data
  isLoading: boolean=false;
  displayForm: boolean =true;
  subCustomer: Subscription;
  custForm: Subscription;
  filterCustomers: Subscription;

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
    return this.salesForm;
  }

  get fDetails(){
    return this.salesForm.get('detail') as FormArray;
  }

  get fCustomer(){
    return this.salesForm.controls; // get('customerInfo');
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private customerService: CustomerService,
    private taxeService: TaxService,
    private salesService: SalesService,
    private authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver,
    private roleService: RolesService,
    private spinnerService: SpinnerService,
    private storesService: StoresService,
    private cashierService: CashiersService,
    private router: Router
  ) { }

  salesForm = this.fb.group({
    Invoice_Date: [formatDate(this.invoiceDate, 'yyyy-MM-dd hh:mm:ss', 'en-US'), Validators.required],
    Document_Id: ['', Validators.required],
    Cashier_Id: ['', Validators.required],
    Company_Id: ['', Validators.required],
    Status: [1, Validators.required],
    User_Id: ['', Validators.required],
    Payment_Status: ['', [Validators.required, Validators.min(1), Validators.max(3)]],  //1 -- PAGADO CONTADO, 2 -- PAGADO TARJETA CREDITO, 3 -- CREDITO
    Payment_Auth: [''],
    Payment_Date: [''],
    Total: [0],
    Total_Taxes: [0],
    Total_Discount: [0],
    Store_Id: ['', Validators.required],
    Customer_Id: [''],
    Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]],
    Address: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]],
    State: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(2)]],
    Email: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(200), Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    Tax_Number: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    Is_Exent:[0],
    Reason: [''],
    Cash_Value: [0],
    Credit_Auth: [0],
    Credit_Digits: [0],
    Guest: [false],
    detail: this.fb.array([this.createDetail()], ArrayValidators.minLength(1))
  });

  createDetail(): FormGroup {
    const itemsDet = this.fb.group({
      Line_No: [0],
      Product_Id: [''],
      Name: ['', [Validators.required]],
      Tax_Id: [''],
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
    this.currency = this.authService.currency();
    this.onValueChanges();
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

  onValueChanges(): void {
    this.custForm = this.salesForm.valueChanges.subscribe(val=>{
      if (val.Is_Exent === true) {
        this.salesForm.controls["Is_Exent"].setValue(1);
        this.salesForm.get("Reason").setValidators([Validators.required, Validators.minLength(3)]);
        this.salesForm.get("Is_Exent").updateValueAndValidity();
        this.salesForm.get("Reason").updateValueAndValidity();
        this.removeTaxes();
      }
      if (val.Is_Exent === false){
        this.salesForm.controls["Is_Exent"].setValue(0);
        this.salesForm.controls["Reason"].setValue('');
        this.salesForm.get("Reason").setValidators(null);
        this.salesForm.get("Is_Exent").updateValueAndValidity();
        this.salesForm.get("Reason").updateValueAndValidity();
        this.addTaxes();
      }
    });
  }

  continueGuest(){
    if (!this.salesForm.get('Guest').value){
      this.salesForm.patchValue({Name: '', Address: '', State: '', Email: '', Tax_Number: '', Customer_Id: ''}, {emitEvent: false});
      this.salesForm.get("Name").setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(500)]);
      this.salesForm.get("Address").setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(500)]);
      this.salesForm.get("State").setValidators([Validators.required, Validators.maxLength(100), Validators.minLength(2)]);
      this.salesForm.get("Email").setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(200), Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]);
      this.salesForm.get("Tax_Number").setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(50)]);
    
      this.salesForm.get("Name").updateValueAndValidity();
      this.salesForm.get("Address").updateValueAndValidity();
      this.salesForm.get("State").updateValueAndValidity();
      this.salesForm.get("Email").updateValueAndValidity();
      this.salesForm.get("Tax_Number").updateValueAndValidity();
    } else {
      this.salesForm.patchValue({Name: '.', Address: '.', State: '.', Email: '.', Tax_Number: '.', Customer_Id: ''}, {emitEvent: false});
      this.salesForm.get("Name").setValidators(null);
      this.salesForm.get("Address").setValidators(null);
      this.salesForm.get("State").setValidators(null);
      this.salesForm.get("Email").setValidators(null);
      this.salesForm.get("Tax_Number").setValidators(null);

      this.salesForm.get("Name").updateValueAndValidity();
      this.salesForm.get("Address").updateValueAndValidity();
      this.salesForm.get("State").updateValueAndValidity();
      this.salesForm.get("Email").updateValueAndValidity();
      this.salesForm.get("Tax_Number").updateValueAndValidity();
    }
  }

  removeTaxes(){
    const item = (<FormArray>this.salesForm.get('detail'));
    for (let i = 0; i < item.length; i++) {
      item.at(i).patchValue({Tax_Id: '', Percentage: 0, Include_Tax: 0});
    }
    this.calcGrandTotal();
  }

  addTaxes(){
    const item = (<FormArray>this.salesForm.get('detail'));
    for (let i = 0; i < item.length; i++) {
      let values = this.taxes.filter(res => Number(res.To_Go) === 0);
      let totalTax: number;
      let total: number;
      let percentage: number;

      percentage = values[0].Percentage;
      total = +item.at(i).value.Qty*(+item.at(i).value.Unit_Price.toFixed(2));
      if (values[0].Include_Tax == false){
        totalTax = +((total-0)*(percentage/100)).toFixed(2);
        total = +(total-0)+totalTax;
      } else {
        totalTax = +((total-0)-((total-0)/(1+(percentage/100)))).toFixed(2);
      }

      item.at(i).patchValue({Tax_Id: values[0].Tax_Id,
        Percentage: percentage,
        Include_Tax: values[0].Include_Tax,
        Total: total,
        Total_Tax: totalTax});
    }
    this.calcGrandTotal();
  }

  initData(){
    this.companyId = this.authService.companyId();
    this.userId = this.authService.userId();
    this.country = this.authService.country();
    this.cashierId = this.authService.cashier();
    this.storeId = this.authService.storeId();
    this.userName = this.authService.userName();
    if (this.country === 'DEU'){
      this.displayedColumns = ['ToGo', 'Name', 'Unit_Price', 'Qty', 'Delivery_Date', 'Actions'];
    } else {
      this.displayedColumns = ['Name', 'Unit_Price', 'Qty', 'Delivery_Date', 'Tax_Id', 'Actions'];
    }

    let data = "companyId=" + this.companyId + "&currPage=1&perPage=20";
    this.taxes$ = this.taxeService.getTaxes(data).pipe(
      map((res: any) => {
        if (res != null){
          this.taxes = res.taxes;
          return res.taxes;
        }
      })
    );
    if (this.cashierId != '') {
      this.storeInfo$ = this.storesService.getStore(this.storeId, this.cashierId);
      this.salesForm.patchValue({Cashier_Id: this.cashierId});
    }

    this.salesForm.controls['User_Id'].setValue(this.userId);
    this.salesForm.controls['Company_Id'].setValue(this.companyId);

    this.filterCustomers = this.salesForm.get('Name').valueChanges
      .pipe(
        map(customer => customer),
        debounceTime(500),
        distinctUntilChanged(),
        filter(customer => typeof customer === 'string' && customer != ''),
        tap(() => this.isLoading = true),
        switchMap(customer =>  
          this.customerService.getCustomers("companyId=" + this.companyId + "&currPage=1&perPage=5&searchValue=" + customer)
            .pipe(
              finalize(() => this.isLoading = false),
              catchError(error => {
                if (error.Status === 404) {
                  this.salesForm.patchValue({
                    'Customer_Id': '',
                    'Address': '',
                    'State': '',
                    'Tax_Number': '',
                    'Email': '',
                    'Is_Exent': 0,
                    'Reason': '',
                    'Status': 1
                  });
                  return Observable.throw(error);
                }
              })
            )
        ),
        map(customer => customer['customers'])
      )
      .subscribe((response: any) => { 
        if (response != null) { 
          this.filteredCustomers = response.map(res => {
            return {
              "Customer_Id": res.Customer_Id,
              "Name": res.Name,
              "Tax_Number": res.Tax_Number
            }
          }); 
        } 
      }, error => {
          return {
            "Customer_Id": "",
            "Name":"",
            "Tax_Number":""
          }
      });
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

  //customer handler
  getErrorMessageCustomer(component: string) {
    if (component === 'Name'){
      return this.fCustomer.Name.hasError('required') ? 'You must enter a value' :
        this.fCustomer.Name.hasError('minlength') ? 'Minimun length 3' :
          this.fCustomer.Name.hasError('maxlength') ? 'Maximum length 500' :
            '';
    }
    if (component === 'Address'){
      return this.fCustomer.Address.hasError('required') ? 'You must enter a value' :
        this.fCustomer.Address.hasError('minlength') ? 'Minimun length 3' :
          this.fCustomer.Address.hasError('maxlength') ? 'Maximum length 500' :
            '';
    }
    if (component === 'Email'){
      return this.fCustomer.Email.hasError('required') ? 'You must enter a value' :
        this.fCustomer.Email.hasError('maxlength') ? 'Maximun length 200' :
          this.fCustomer.Email.hasError('pattern') ? 'Invalid Email' :
            '';
    }
    if (component === 'State'){
      return this.fCustomer.State.hasError('required') ? 'You must enter a value' :
        this.fCustomer.State.hasError('maxlength') ? 'Maximun length 100' :
          this.fCustomer.State.hasError('minlength') ? 'Minimun length 2' :
            '';
    }
    if (component === 'Tax_Number'){
      return this.fCustomer.Tax_Number.hasError('required') ? 'You must enter a value' :
        this.fCustomer.Tax_Number.hasError('minlength') ? 'Minimun length 2' :
          this.fCustomer.Tax_Number.hasError('maxlength') ? 'Maximun length 50' :
            '';
    }
    if (component === 'Reason'){
      return this.fCustomer.Reason.hasError('required') ? 'You must enter a value' :
        this.fCustomer.Reason.hasError('minlength') ? 'Minimun length 2' :
          this.fCustomer.Reason.hasError('maxlength') ? 'Maximun length 500' :
            '';
    }
  }

  //customer handler
  getCustomerSelected($event){
    let customerId = $event.Customer_Id;
    if (customerId != '') {
      this.subCustomer = this.customerService.getCustomer(customerId).subscribe(res => {
        if (res != null){
          this.salesForm.patchValue({
            'Customer_Id': res.Customer_Id,
            'Address': res.Address,
            'State': res.State,
            'Email': res.Email,
            'Tax_Number': res.Tax_Number,
            'Is_Exent': res.Is_Exent,
            'Reason': res.Reason
          });
        }
      }, 
      error => {
        this.salesForm.patchValue({'Customer_Id':'', 'Name':'', 'Address':'', 'State':'', 'Email': '', 'Tax_Number':'', 'Is_Exent': 0, 'Reason': ''});
      });
    } else {
      this.salesForm.patchValue({'Customer_Id':'', 'Name':'', 'Address':'', 'State':'', 'Email': '', 'Tax_Number':'', 'Is_Exent': 0, 'Reason': ''});
    }
  }

  //customer autocomplete
  displayFn(customer?: Generic): string | undefined {
    return customer ? customer.Name : undefined;
  }

  setStore(store: string){
    this.storeId = store;
    this.salesForm.patchValue({ Store_Id: store});
  }

  setDocto(docto: string){
    this.doctoId = docto;
    this.salesForm.patchValue({Document_Id: docto});
  }

  setCashier(cashier: string){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: 'Cashier', 
      message: 'Do you want to closed this cashier if still remains open?', 
      success: false, 
      error: false, 
      warn: false,
      ask: true
    };
    dialogConfig.width ='280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined){
        this.setCashier$ = this.cashierService.postCashier(cashier, {User_Id: this.userId, Company_Id: this.companyId, Store_Id: this.storeId, Closed: 1}).pipe(
          map((res: any) => {
            if (res != null){
              if (res.Codigo === 100) {
                this.cashierId = cashier;
                this.storeInfo$ = this.storesService.getStore(this.storeId, this.cashierId);
                
                var data = JSON.parse(sessionStorage.getItem('OCT_USS'));
                data.Cashier_Id = cashier;
                sessionStorage.setItem('OCT_USS', JSON.stringify(data));
                
                this.salesForm.patchValue({Cashier_Id: cashier});
              }
            } else {
              this.openDialog('Cashier', 'There is a problem with your request try again', false, true, false);
            }
          })
        );
      } else {
        this.setCashier$ = this.cashierService.postCashier(cashier, {User_Id: this.userId, Company_Id: this.companyId, Store_Id: this.storeId, Closed: 0}).pipe(
          map((res: any) => {
            if (res != null){
              if (res.Codigo === 100) {
                this.cashierId = cashier;
                this.storeInfo$ = this.storesService.getStore(this.storeId, this.cashierId);
                
                var data = JSON.parse(sessionStorage.getItem('OCT_USS'));
                data.Cashier_Id = cashier;
                sessionStorage.setItem('OCT_USS', JSON.stringify(data));
                
                this.salesForm.patchValue({Cashier_Id: cashier});
              } else {
                this.openDialog('Cashier', 'The cashier you selected are in use', false, true, false);
              }
            } else {
              this.openDialog('Cashier', 'The cashier you selected are in use', false, true, false);
            }
          })
        );
      }
    });
    
  }

  productSelected(product: Product) {
    if (product.Product_Id == '') {return;}
    const item = this.salesForm.controls.detail as FormArray;
    if (item.length === 0) { (<FormArray>this.salesForm.get('detail')).push(this.createDetail()); }
    let values = this.taxes.filter(res => Number(res.To_Go) === 0);

    let unitValue = product.Unit_Price;
    if (product.Type === 'services' && product.Unit > 0) {
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
    total = +product.Qty*(+unitValue.toFixed(2));
    if (values[0].Include_Tax == false){
      totalTax = +((total-0)*(percentage/100)).toFixed(2);
      total = +(total-0)+totalTax;
    } else {
      totalTax = +((total-0)-((total-0)/(1+(percentage/100)))).toFixed(2);
    }
    item.at(this.index).setValue({
      Line_No: this.lineNo,
      Product_Id: product.Product_Id,
      Name: product.Name,
      Unit_Price: +unitValue.toFixed(2),
      Qty: +product.Qty,
      Discount: 0,
      ToGo: 0,
      Tax_Id: values[0].Tax_Id,
      Percentage: percentage,
      Include_Tax: values[0].Include_Tax,
      Total: total,
      Total_Tax: totalTax,
      Type: product.Type,
      Delivery_Date: '',
      Actions:''
    }); 

    //UPDATE GRAND TOTAL
    this.calcGrandTotal();

    this._snackBar.open('Product added successful', 'Close', {
      duration: 2000,
      panelClass: 'style-succes'
    });
  }

  validateControls(){
    const invalid = [];
    const controls = this.salesForm.controls;
    for (const name in controls) {
        if (controls[name].invalid) {
            invalid.push(name);
        }
    }
    return invalid;
  }

  onSubmit(){
    if (this.salesForm.invalid) { return; }
    var spinnerRef = this.spinnerService.start("Saving Sale...");
    let form = cloneDeep(this.salesForm);

    let nameCust;
    if (form.value.Name.Name != undefined){
      nameCust = form.value.Name.Name;
    } else {
      nameCust = form.value.Name;
    }

    let payAuth = '';
    if (this.paymentOpt === 'cash'){
      payAuth = JSON.stringify(JSON.parse('{ "Cash" : ' + form.value.Cash_Value + ' }'));
    }
    if (this.paymentOpt === 'creditcard'){
      payAuth = JSON.stringify(JSON.parse('{ "CC" : ' + form.value.Credit_Digits + ', "Auth" : ' + form.value.Credit_Auth + ' }'));
    }

    let dataForm =  { 
      "Document_Id": form.value.Document_Id,
      "Cashier_Id": form.value.Cashier_Id,
      "Customer_Id": (form.value.Customer_Id === null ? '' : form.value.Customer_Id),
      "Name": nameCust,
      "Tax_Number": form.value.Tax_Number,
      "Customer_Address": form.value.Address,
      "Customer_Email": form.value.Email,
      "State": form.value.State,
      "Is_Exent": form.value.Is_Exent,
      "Reason": form.value.Reason,
      "Payment_Status": form.value.Payment_Status,
      "Payment_Auth": payAuth,
      "Payment_Date": form.value.Payment_Date,
      "Invoice_Date": form.value.Invoice_Date,
      "User_Id": form.value.User_Id,
      "User_Name": this.userName,
      "Company_Id": form.value.Company_Id,
      "Total": form.value.Total,
      "Total_Taxes": form.value.Total_Taxes,
      "Total_Discount": form.value.Total_Discount,
      "Store_Id": form.value.Store_Id,
      "detail": []
    }
    let lines = form.value.detail;
    dataForm['detail'] = lines;
    this.salesDocto$ = this.salesService.postSale(dataForm).pipe(
      map((res: any) => {
        this.savingSale = true;
        let codigo=0;
        this.spinnerService.stop(spinnerRef);
        if (res.Codigo === 100){
          this.invoiceNumber = res.Invoice_Id;
          codigo = 100;
        }
        return codigo;
      }),
      delay(500),
      map((res: any) => {
        if (res === 100){
          window.print();
          return res;
        }
      }),
      delay(500),
      tap((res: any)  => {
        if (res === 100){
          this.salesForm.reset({Invoice_Date:formatDate(this.invoiceDate, 'yyyy-MM-dd hh:mm:ss', 'en-US'), Document_Id: this.doctoId, Company_Id: this.companyId, Cashier_Id: this.cashierId, Status: 1, User_Id: this.userId, Payment_Status: '', Payment_Date: '', Payment_Auth: '', Total: 0, Total_Taxes: 0, Total_Discount:0, Store_Id: this.storeId, Customer_Id:'', Name:'', Address:'', State:'', Email: '', Tax_Number:'', Is_Exent: 0, Reason: '',  Cash_Value: '', Credit_Auth: '', Credit_Digits: '', Guest: false, detail: this.fb.array([], ArrayValidators.minLength(1)) });
          if (this.subCustomer){
            this.subCustomer.unsubscribe();
          }
          this.lineNo = 0;
          this.step = 1;
          this.paymentOpt = '';
          (<FormArray>this.salesForm.get('detail')).clear(); 
          (<FormArray>this.salesForm.get('detail')).push(this.createDetail());
          this.savingSale = false;
        } else {
          this.savingSale = false;
          this.openDialog('Sales', 'An error occurred try again', false, true, false);
        }
      })
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

  paymentMethod(value){
    this.paymentOpt = value;
    if (this.paymentOpt === 'cash' || this.paymentOpt === 'creditcard'){
      const todayDate = new Date();
      const payDate = formatDate(todayDate, 'yyyy-MM-dd hh:mm:ss', 'en-US');
      this.salesForm.controls['Payment_Date'].setValue(payDate);
    } 
    if (this.paymentOpt === 'cash'){
      this.salesForm.controls['Payment_Status'].setValue(1);
    }
    if (this.paymentOpt === 'creditcard'){
      this.salesForm.controls['Payment_Status'].setValue(2);
    }
    if (this.paymentOpt === 'credit') {
      this.salesForm.controls['Payment_Status'].setValue(3);
      this.salesForm.controls['Payment_Date'].setValue('');
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
      let values = this.taxes.filter(res => Number(res.To_Go) === 1);
      item.at(index).patchValue({'Tax_Id': values[0].Tax_Id, 'Percentage':values[0].Percentage, 'Include_Tax': values[0].Include_Tax});
    } else{
      let values = this.taxes.filter(res => Number(res.To_Go) === 0);
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

  trackRow(index: number, item: any) {
    return item.Line_No;
  }

  ngOnDestroy() {
    if (this.filterCustomers){
      this.filterCustomers.unsubscribe();
    }
    if (this.subsItems){
      this.subsItems.unsubscribe();
    }
    if (this.custForm){
      this.custForm.unsubscribe();
    }
  }
}
