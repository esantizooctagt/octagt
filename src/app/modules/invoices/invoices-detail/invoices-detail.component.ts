import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SalesService } from '@app/services';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';

@Component({
  selector: 'app-invoices-detail',
  templateUrl: './invoices-detail.component.html',
  styleUrls: ['./invoices-detail.component.scss']
})
export class InvoicesDetailComponent implements OnInit {
  public invoice$: Observable<any>;
  public invoiceId: string = '';
  public displayForm: boolean = true;
  public onError: string = '';
  public country: string = '';
  public currency: string = '';
  private companyId: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private salesService: SalesService
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
    Lines: this.fb.array([this.invoiceDetail()])
  })

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

  displayedColumns = ['Product', 'Qty', 'Unit_Price', 'Percentage', 'To_Go', 'Discount', 'Total', 'Delivery_Date'];

  ngOnInit() {
    var spinnerRef = this.spinnerService.start("Loading Invoice...");  
    this.invoiceId = this.route.snapshot.paramMap.get('idInvoice');
    this.companyId = this.authService.companyId();
    this.country = this.authService.country();
    this.currency = this.authService.currency();

    if (this.country === 'DEU'){
      this.displayedColumns = ['Product', 'Qty', 'Unit_Price', 'Percentage', 'To_Go', 'Discount', 'Total', 'Delivery_Date'];
    } else {
      this.displayedColumns = ['Product', 'Qty', 'Unit_Price', 'Percentage', 'Discount', 'Total', 'Delivery_Date'];
    }
    if (this.invoiceId != undefined) {
      this.invoice$ = this.salesService.getInvoice(this.invoiceId).pipe(
        map((res: any) => {
          if (res != null){
            this.invoiceForm.patchValue({
              Invoice_Id: res.Invoice_Id,
              Invoice_Number: res.Invoice_Number,
              Status: res.Status,
              Invoice_Date: res.Invoice_Date,
              Name: res.Name,
              Email: res.Email,
              Address: res.Address,
              Payment_Status: res.Payment_Status,
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
}
