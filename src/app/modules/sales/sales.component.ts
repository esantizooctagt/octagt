import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services';
import { Customer, Detail, Product, Tax } from '@app/_models';
import { ArrayValidators } from '@app/validators';
import { CustomerService, ProductService, CompanyService, TaxService, SalesService } from "@app/services";
import { Generic } from '@app/_models';
import { FormBuilder, Validators, FormControl, FormArray, FormGroup } from '@angular/forms';
import { AlertService  } from "@shared/alert";
import { formatDate } from '@angular/common';
import * as cloneDeep  from 'lodash/cloneDeep';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  listCustomers: Generic[]=[];
  taxes: Tax[]=[];
  onError: string='';
  loading: boolean=false;

  custId: string='None';
  invoiceDate: Date = new Date();
  customerId: string='';
  companyId: string = '';
  userId: string = '';
  country: string = '';
  dispLoading: boolean;
  cash: string='';

  ingresado: string='';
  lineNo: number=0;
  
  get fSales(){
    return this.salesForm.controls;
  }
  constructor(
    private customerService: CustomerService,
    private taxeService: TaxService,
    private salesService: SalesService,
    private authService: AuthService,
    private productService: ProductService,
    private companyService: CompanyService,
    private fb: FormBuilder,
    private alertService: AlertService
  ) { }

  salesForm = this.fb.group({
    Invoice_Date: [formatDate(this.invoiceDate, 'yyyy-MM-dd hh:mm:ss', 'en-US'), Validators.required],
    Document_Id: ['b01238a0371e11eaa2531603e958f2e9', Validators.required],
    Company_Id: ['', Validators.required],
    Status: [1, Validators.required],
    User_Id: [''],
    Payment_Status: ['', Validators.required],  //1 -- PAGADO, 2 -- CREDITO
    Payment_Date: ['', Validators.required],
    Total: [0],
    Total_Taxes: [0],
    Total_Discount: [0],
    Store_Id: ['135557c3371e11eaa2531603e958f2e9', Validators.required],
    customerInfo: new FormControl(''),
    detail: this.fb.array([this.createDetail()], ArrayValidators.minLength(1))
  });

  createDetail(): FormGroup {
    const items = this.fb.group({
      Line_No: [0],
      Product_Id: [''],
      Name: ['', [Validators.required]],
      Tax_Id: ['', [Validators.required]],
      Percentage: [0],
      Include_Tax: [0],
      Qty: [0, [Validators.required]],
      Unit_Price: [0, [Validators.required]],
      ToGo: [0],
      Discount: [0],
      Total: [0],
      Total_Tax: [0],
      Delivery_Date: [''],
      Added: [0]
    });
    items.valueChanges
      .subscribe(data => this.onValueChanged(data));

    return items;
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
    this.companyId = this.authService.companyId();
    this.userId = this.authService.userId();

    let data = "companyId=" + this.companyId + "&currPage=1&perPage=20";
    this.taxeService.getTaxes(data).subscribe((res: any) => {
      if (res != null){
        this.taxes = res.taxes;
      }
    },
    error => {
      this.alertService.error('Error ! ' + error.Message);
    });

    this.companyService.getCompany(this.companyId).subscribe((res: any) => {
      if (res != null) {
        this.country = res.Country;
      }
    },
    error => { 
      this.alertService.error('Error ! ' + error.Message);
    });

    this.salesForm.controls['User_Id'].setValue(this.userId);
    this.salesForm.controls['Company_Id'].setValue(this.companyId);
  }

  getCustomers($event){
    this.loadCustomers($event);
  }

  productSelected(product: Product) {
    this.productService.getProduct(product.Product_Id).subscribe((res: any) => {
      if (res != null) {
        const item = this.salesForm.controls.detail as FormArray;
        let values = this.taxes.filter(res => res.To_Go == false); 
        item.at(this.lineNo).setValue({
          'Line_No': this.lineNo+1,
          'Product_Id': res.Product_Id,
          'Name': res.Name,
          'Unit_Price': +res.Unit_Price.toFixed(2),
          'Qty': 1,
          'Discount': 0,
          'ToGo': 0,
          'Tax_Id': values[0].Tax_Id,
          'Percentage': values[0].Percentage,
          'Include_Tax': values[0].Include_Tax,
          'Total': 0,
          'Total_Tax': 0,
          'Delivery_Date': '',
          'Added': 0
        });

        let items = this.salesForm.get('detail') as FormArray;
        items.controls.map((ctrl) => {
          ctrl.get('Name').setValidators([Validators.required]);
          ctrl.get('Unit_Price').setValidators([Validators.required]);
          ctrl.get('Qty').setValidators([Validators.required]);
          ctrl.get('Tax_Id').setValidators([Validators.required]);
          ctrl.get('Name').updateValueAndValidity();
          ctrl.get('Unit_Price').updateValueAndValidity();
          ctrl.get('Qty').updateValueAndValidity();
          ctrl.get('Tax_Id').updateValueAndValidity();
        });
      }
    },
    error => { 
      this.alertService.error('Error ! ' + error.Message);
    });
  }

  getCustomerSelected($event){
    this.customerId = $event;
    if (this.customerId != '') {
      this.customerService.getCustomer(this.customerId).subscribe((res: any) => {
        if (res != null) {
          this.salesForm.get('customerInfo').setValue({
            'Customer_Id': res.Customer_Id,
            'Name': res.Name,
            'Tax_Number': res.Tax_Number,
            'Is_Exent': res.Is_Exent,
            'Reason': res.Reason,
            'Status': 1
          });
        }
      },
      error => { 
        this.alertService.error('Error ! ' + error.Message);
      });
    } else {
      this.salesForm.get('customerInfo').reset({'Customer_Id':'', 'Name':'', 'Tax_Number':'', 'Is_Exent': 0, 'Reason': '', 'Status': 1});
    }
  }

  loadCustomers(crValue){
    this.onError = '';
    this.custId = 'None';
    if (crValue === '') { 
      this.listCustomers = [{"c":"","n":"Not Found","e":"","t":""}]; 
      return; 
    }
    let data = "companyId=" + this.companyId + "&currPage=1&perPage=5&searchValue=" + crValue;

    this.customerService.getCustomers(data).subscribe((res: any) => {
      if (res != null) {
        this.listCustomers = res.customers.map(customer => {
          return {
            "c": customer.Customer_Id,
            "n": customer.Name,
            "e": customer.Email,
            "t": customer.Tax_Number
          }
        });
        this.dispLoading = false;
      }
    },
    error => {
      this.listCustomers = [{"c":"","n":"Not Found","e":"","t":""}];
      this.onError = error.Message;
      this.dispLoading = false;
    });
  }

  onSubmit(){
    if (this.salesForm.invalid) {
      return;
    }
    this.loading = true;
    let form = cloneDeep(this.salesForm);

    let dataForm =  { 
      "Document_Id": form.value.Document_Id,
      "Customer_Id": form.get('customerInfo').value.Customer_Id,
      "Name": form.get('customerInfo').value.Name,
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
    
    let lines = form.value.detail.filter(x => x.Added == 1);
    for (let i = 0; i < lines.length; i++) {
      delete lines[i].Added;
    }
    dataForm['detail'] = lines;
    this.salesService.postSale(dataForm)
      .subscribe(
        response =>  {
          this.alertService.success('Sales created successful');
          this.loading = false;
          this.salesForm.reset({'Invoice_Date':formatDate(this.invoiceDate, 'yyyy-MM-dd hh:mm:ss', 'en-US'), 'Document_Id': 'b01238a0371e11eaa2531603e958f2e9', 'Company_Id': this.companyId, 'Status': 1, 'User_Id': this.userId, 'Payment_Status': '', 'Payment_Date': '', 'Total': 0, 'Total_Taxes': 0, 'Total_Discount':0, 'Store_Id':'135557c3371e11eaa2531603e958f2e9', 'customerInfo': '', 'detail': this.fb.array([], ArrayValidators.minLength(1)) });
          // this.salesForm.get('customerInfo').reset({'Customer_Id':'', 'Name':'', 'Tax_Number':'', 'Is_Exent': 0, 'Reason': '', 'Status': 1});
          this.lineNo = 0;
          this.cash = '';
          (<FormArray>this.salesForm.get('detail')).clear(); 
          (<FormArray>this.salesForm.get('detail')).push(this.createDetail());

          this.custId = "";
        },
        error => { 
          this.loading = false;
          this.alertService.error('Error ! ' + error.Message);
        }
      );
  }

  addItem(): void {
    //UPDATE EXISTING ROW
    const line = (<FormArray>this.salesForm.get('detail'));
    line.at(line.value.length-1).patchValue({'Added': 1});

    //ADD NEW ROW AT THE END
    (<FormArray>this.salesForm.get('detail')).push(this.createDetail());
    this.lineNo += 1;

    let items = this.salesForm.get('detail') as FormArray;
    items.controls.map((ctrl) => {
      ctrl.get('Name').setValidators(null);
      ctrl.get('Unit_Price').setValidators(null);
      ctrl.get('Qty').setValidators(null);
      ctrl.get('Tax_Id').setValidators(null);
      ctrl.get('Name').updateValueAndValidity();
      ctrl.get('Unit_Price').updateValueAndValidity();
      ctrl.get('Qty').updateValueAndValidity();
      ctrl.get('Tax_Id').updateValueAndValidity();
    });

    const item = (<FormArray>this.salesForm.get('detail'));
    let values = this.taxes.filter(res => res.To_Go == false); 
    item.at(item.value.length-1).patchValue({'Tax_Id': values[0].Tax_Id, 'Percentage':values[0].Percentage, 'Include_Tax': values[0].Include_Tax});
  }

  removeItem(index){
    (<FormArray>this.salesForm.get('detail')).removeAt(index);

    const item = (<FormArray>this.salesForm.get('detail'))
    
    this.lineNo = 1;
    for (let i = 0; i < item.length-1; i++) {
      item.at(i).patchValue({'Line_No': this.lineNo});
      this.lineNo += 1;
    }
    this.lineNo -= 1;
    this.calcGrandTotal();
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
    this.ingresado = this.ingresado + value;
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
    let values = this.taxes.filter(res => res.Tax_Id.includes(event.target.value)); 
    item.at(index).patchValue({'Tax_Id': event.target.value, 'Percentage':values[0].Percentage, 'Include_Tax': values[0].Include_Tax});
  }

  setTax(event, index){
    const item = (<FormArray>this.salesForm.get('detail'));
    if (event.target.checked === true){
      let values = this.taxes.filter(res => res.To_Go == true); 
      item.at(index).patchValue({'Tax_Id': values[0].Tax_Id, 'Percentage':values[0].Percentage, 'Include_Tax': values[0].Include_Tax});
    } else{
      let values = this.taxes.filter(res => res.To_Go == false); 
      item.at(index).patchValue({'Tax_Id': values[0].Tax_Id, 'Percentage':values[0].Percentage, 'Include_Tax': values[0].Include_Tax});
    }
  }
}
