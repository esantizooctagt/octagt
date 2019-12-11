import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Customer } from '@app/_models';
import { FormBuilder, Validators } from '@angular/forms';
import { CustomerService } from "@app/services";
import { AuthService } from '@core/services';
import { Router } from '@angular/router';
import { MonitorService } from "@shared/monitor.service";
import { AlertService  } from "@shared/alert";

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {

  @Input() customer: Customer;

  get Name(){
    return this.customerForm.get('Name');
  }

  message: string='';
  submitted = false;
  companyId: string='';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private customerService: CustomerService,
    private router: Router,
    private data: MonitorService,
    private alertService: AlertService 
  ) { }

  customerForm = this.fb.group({
    Customer_Id: [''],
    Company_Id: [''],
    Name: ['', [Validators.required, Validators.minLength(3)]],
    Address: [''],
    House_No: [''],
    Country: [''],
    State: [''],
    Phone: [''],
    Postal_Code: [''],
    Tax_Number: [''],
    Is_Exent:[false],
    Reason: [''],
    Email: [''],
    Status: [0]
  })

  ngOnInit() {
    this.companyId = this.authService.companyId();  
    this.data.monitorMessage
      .subscribe((message: any) => {
        this.message = message;
      });
    this.onValueChanges();
  }

  onValueChanges(): void {
    this.customerForm.valueChanges.subscribe(val=>{
      if (val.Status === true) {
        this.customerForm.controls["Status"].setValue(1);
      }
      if (val.Status === false){
        this.customerForm.controls["Status"].setValue(0);
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.customer.currentValue != undefined) {
      let res = changes.customer.currentValue;
      this.customerForm.setValue({
        Customer_Id: res.Customer_Id,
        Company_Id: res.Company_Id,
        Name: res.Name,
        Address: res.Address,
        House_No: res.House_No,
        Country: res.Country,
        State: res.State,
        Phone: res.Phone,
        Postal_Code: res.Postal_Code,
        Tax_Number: res.Tax_Number,
        Is_Exent: res.Is_Exent,
        Reason: res.Reason,
        Email: res.Email,
        Status: res.Status
      });
    }
  }

  onSubmit(){
    let customerId = this.customerForm.value.Customer_Id;
    let tokenValue = this.authService.currentToken();
    this.submitted = true;
    if (customerId !== '' && customerId !== null) {  
      let dataForm = this.customerForm.value;
      delete dataForm.Customer_Id; 
      delete dataForm.Company_Id;
      this.customerService.updateCustomer(customerId, tokenValue, dataForm)
        .subscribe(
          response =>  {
            this.submitted = false;
            this.customerForm.reset({Is_Exent:false, Status:0});
            this.data.changeData('change');
            this.alertService.success('Customer created successful');
          },
          error => { 
            this.alertService.error('Error ! ' + error);
          }
        );
    } else {
      let dataForm = this.customerForm.value;
      delete dataForm.Customer_Id;
      dataForm.Company_Id = this.companyId;
      this.customerService.postCustomer(tokenValue, dataForm)
        .subscribe(
          response => {
            this.submitted = false;
            this.customerForm.reset({Is_Exent:false, Status:0});
            this.data.changeData('change');
            this.alertService.success('Customer updated successful');
          },
          error => { 
            this.alertService.error('Error ! ' + error);
          }
        );
    }
  }

  onCancel(){
    this.submitted = true;
    this.customerForm.reset({Is_Exent:false, Status:0});
    this.data.changeData('change');
  }

}
