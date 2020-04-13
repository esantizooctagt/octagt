import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SalesService } from '@app/services';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap, shareReplay } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-invoices-detail',
  templateUrl: './invoices-detail.component.html',
  styleUrls: ['./invoices-detail.component.scss']
})
export class InvoicesDetailComponent implements OnInit {
  @ViewChild(MatTable) invoiceTable :MatTable<any>;
  
  public invoice$: Observable<any>;
  public invoicePayed$: Observable<any>;
  public invoiceId: string = '';
  public displayForm: boolean = true;
  public onError: string = '';
  public country: string = '';
  public currency: string = '';
  private companyId: string = '';

  displayedColumns = ['Product', 'Qty', 'Unit_Price', 'Percentage', 'To_Go', 'Discount', 'Total', 'Delivery_Date'];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => { 
        if (result.matches) {
          this.displayedColumns = ['Product', 'Qty', 'Total'];
          if (this.invoiceTable){
            this.invoiceTable.renderRows();
          }
        } else {
          if (this.country === 'DEU'){
            this.displayedColumns = ['Product', 'Qty', 'Unit_Price', 'Percentage', 'To_Go', 'Discount', 'Total', 'Delivery_Date'];
          } else {
            this.displayedColumns = ['Product', 'Qty', 'Unit_Price', 'Percentage', 'Discount', 'Total', 'Delivery_Date'];
          }
          if (this.invoiceTable){
            this.invoiceTable.renderRows();
          }
        }
        return result.matches; 
      }),
      shareReplay()
    );

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private salesService: SalesService,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver
  ) { }

  invoiceForm = this.fb.group({
    Invoice_Id: [''],
    Invoice_Number: [''],
    Status: [''],
    Invoice_Date: [''],
    Name: [''],
    Email: [''],
    Address: [''],
    Payment_Status: [''],
    User_Name: [''],
    Total_Taxes: [''],
    Total: [''],
    Store_Name: [''],
    Store_Address:[''],
    Store_Tax:[''],
    Tax_Number: [''],
    Is_Exent: [''],
    Reason: [''],
    Total_Discount: [''],
    Payment_Date: [''],
    Payment_Auth: [''],
    Lines: this.fb.array([this.invoiceDetail()])
  })

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

  invoiceDetail(): FormGroup {
    const lineDet = this.fb.group({
      Product: [''],
      Percentage: [0],
      Qty: [0],
      Unit_Price: [0], 
      To_Go: [''],
      Discount: [0],
      Total: [0],
      Delivery_Date: ['']
    });
    return lineDet;
  }

  ngOnInit() {
    var spinnerRef = this.spinnerService.start("Loading Invoice...");  
    this.invoiceId = this.route.snapshot.paramMap.get('idInvoice');
    this.companyId = this.authService.companyId();
    this.country = this.authService.country();
    this.currency = this.authService.currency();

    // if (this.country === 'DEU'){
    //   this.displayedColumns = ['Product', 'Qty', 'Unit_Price', 'Percentage', 'To_Go', 'Discount', 'Total', 'Delivery_Date'];
    // } else {
    //   this.displayedColumns = ['Product', 'Qty', 'Unit_Price', 'Percentage', 'Discount', 'Total', 'Delivery_Date'];
    // }
    if (this.invoiceId != undefined) {
      this.invoice$ = this.salesService.getInvoice(this.invoiceId).pipe(
        map((res: any) => {
          if (res != null){
            let infoPay = '';
            if (res.Payment_Status === 1 && (res.Payment_Auth != null || res.Payment_Auth != '')){
              infoPay = JSON.parse(res.Payment_Auth).Cash;
            }  
            if (res.Payment_Status === 2 && (res.Payment_Auth != null || res.Payment_Auth != '')){
              infoPay = JSON.parse(res.Payment_Auth).Auth + ' / ' + JSON.parse(res.Payment_Auth).CC;
            }
            this.invoiceForm.patchValue({
              Invoice_Id: res.Invoice_Id,
              Invoice_Number: res.Invoice_Number,
              Status: res.Status,
              Invoice_Date: res.Invoice_Date,
              Name: res.Name,
              Email: res.Email,
              Address: res.Address,
              Payment_Status: res.Payment_Status,
              Payment_Auth: infoPay,
              User_Name: res.User_Name,
              Total_Taxes: res.Total_Taxes,
              Total: res.Total,
              Store_Name: res.Store_Name,
              Store_Address: res.Store_Address,
              Store_Tax: res.Store_Tax,
              Tax_Number: res.Tax_Number,
              Is_Exent: res.Is_Exent,
              Reason: res.Reason,
              Total_Discount: res.Total_Discount,
              Payment_Date: res.Payment_Date,
              Lines: []
            });
            this.invoiceForm.setControl('Lines', this.setExistingLines(res.Lines));
            this.spinnerService.stop(spinnerRef);
          }
        })
      );
    }
  }

  setExistingLines(lines: any[]){
    const formArray = new FormArray([]);
    lines.forEach(line => {
      formArray.push(
        this.fb.group({
          Product: line.Product,
          Percentage: line.Percentage,
          Qty: line.Qty,
          Unit_Price: line.Unit_Price,
          To_Go: line.To_Go,
          Discount: line.Discount,
          Total: line.Total,
          Delivery_Date: line.Delivery_Date
        }));
    });
    return formArray;
  }

  onPrint(){
    window.print();
  }

  onPayed(invoiceId: string){
    var spinnerRef = this.spinnerService.start("Updating Invoice...");
    this.invoicePayed$ = this.salesService.updatePayment(invoiceId).pipe(
      tap(res => {
        if (res != null){
          this.spinnerService.stop(spinnerRef);
          this.openDialog('Invoices', 'Invoice updated successful', true, false, false);
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog('Error !', err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }

  onVoid(invoiceId: string){
    var spinnerRef = this.spinnerService.start("Void Invoice...");
    this.invoicePayed$ = this.salesService.voidInvoice(invoiceId).pipe(
      tap(res => {
        if (res != null){
          this.invoiceForm.patchValue({Status:2});
          this.spinnerService.stop(spinnerRef);
          this.openDialog('Invoices', 'Invoice void successful', true, false, false);
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog('Error !', err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }
}
