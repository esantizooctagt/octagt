import { Component, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormControl, NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, FormGroup } from '@angular/forms';
import { Subscription, Observable, throwError } from 'rxjs';
import { Generic, Customers, CustomerList, Customer } from '@app/_models';
import { ConfirmValidParentMatcher } from '@app/validators';
import { debounceTime, tap, switchMap, finalize, map, catchError, filter, distinctUntilChanged } from 'rxjs/operators';
import { CustomerService } from "@app/services";
import { AuthService } from '@core/services';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-customerbasic',
  templateUrl: './customerbasic.component.html',
  styleUrls: ['./customerbasic.component.scss'],
  providers: [{
   provide: NG_VALUE_ACCESSOR,
   useExisting: forwardRef(() => CustomerbasicComponent),
   multi: true
  },
  {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => CustomerbasicComponent),
    multi: true
  }
  ]
})
export class CustomerbasicComponent implements OnInit, ControlValueAccessor, OnDestroy {
  customerBasicForm: FormGroup;
  subscriptions: Subscription[] = [];
  filterCustomers: Subscription;
  filteredCustomers: Customers[] = [];
  customer$: Observable<Customer>;
  custForm: Subscription;
  blankList: CustomerList[];
  companyId: string = '';
  isLoading: boolean=false;
  displayForm: boolean =true;
  
  get fCustomer(){
    return this.customerBasicForm.controls;
  }

  confirmValidParentMatcher = new ConfirmValidParentMatcher();
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private customerService: CustomerService,
    private dialog: MatDialog
  ) {
    this.customerBasicForm = this.fb.group({
      Customer_Id: [''],
      Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]],
      Address: ['', [Validators.minLength(3), Validators.maxLength(500)]],
      State: ['', [Validators.maxLength(100), Validators.minLength(2)]],
      Tax_Number: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      Is_Exent:[0],
      Reason: [''],
      Status: [1]
    });

    this.subscriptions.push(
      // any time the inner form changes update the parent of any change
      this.customerBasicForm.valueChanges.subscribe(value => {
        this.onChange(value);
        this.onTouched();
      })
    );
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

  ngOnInit() {
    this.companyId = this.authService.companyId();  
    this.onValueChanges();
    this.filterCustomers = this.customerBasicForm.get('Name').valueChanges
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
                  this.customerBasicForm.patchValue({
                    'Customer_Id': '',
                    'Address': '',
                    'State': '',
                    'Tax_Number': '',
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
        this.filteredCustomers.map(_ => {
          return {
            "Customer_Id": "",
            "Name":"",
            "Tax_Number":""
          }
        })
      });
  }

  getCustomerSelected($event){
    let customerId = $event.Customer_Id;
    if (customerId != '') {
      this.customer$ = this.customerService.getCustomer(customerId).pipe(
        tap((res: any) => {
          if (res != null) {
            this.customerBasicForm.patchValue({
              'Customer_Id': res.Customer_Id,
              'Address': res.Address,
              'State': res.State,
              'Tax_Number': res.Tax_Number,
              'Is_Exent': res.Is_Exent,
              'Reason': res.Reason,
              'Status': 1
            });
          }
        }),
        catchError(err => {
          this.openDialog('Error !', err.Message, false, true, false);
          this.customerBasicForm.get('customerInfo').reset({'Customer_Id':'', 'Name':'', 'Address':'', 'State':'', 'Tax_Number':'', 'Is_Exent': 0, 'Reason': '', 'Status': 1});
          return throwError(err || err.message); 
        })
      );
    } else {
      this.customerBasicForm.get('customerInfo').reset({'Customer_Id':'', 'Name':'', 'Address':'', 'State':'', 'Tax_Number':'', 'Is_Exent': 0, 'Reason': '', 'Status': 1});
    }
  }

  displayFn(customer?: Generic): string | undefined {
    return customer ? customer.Name : undefined;
  }

  getErrorMessage(component: string) {
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
    if (component === 'State'){
      return this.fCustomer.State.hasError('maxlength') ? 'Maximun length 100' :
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

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.filterCustomers.unsubscribe();
    this.custForm.unsubscribe();
  }

  onValueChanges(): void {
    this.custForm = this.customerBasicForm.valueChanges.subscribe(val=>{
      if (val.Is_Exent === true) {
        this.customerBasicForm.controls["Is_Exent"].setValue(1);
        this.customerBasicForm.get("Reason").setValidators([Validators.required, Validators.minLength(3)]);
      }
      if (val.Is_Exent === false){
        this.customerBasicForm.controls["Is_Exent"].setValue(0);
        this.customerBasicForm.controls["Reason"].setValue('');
        this.customerBasicForm.get("Reason").setValidators(null);
      }
    });
  }

  public onTouched: () => void = () => {};
  public onChange: any = () => {};

  writeValue(val: any): void {
    if (val === '' || val === null) { this.customerBasicForm.reset({'Customer_Id':'', 'Name':'', 'Address':'', 'State':'', 'Tax_Number':'', 'Is_Exent': 0, 'Reason': '', 'Status': 1}); return; }
    val && this.customerBasicForm.setValue(val, { emitEvent: false });
  }
  
  registerOnChange(fn: any): void {
    // console.log("on change");
    // this.customerBasicForm.valueChanges.subscribe(fn);
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    // console.log("on blur");
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.customerBasicForm.disable() : this.customerBasicForm.enable();
  }

  validate(_: FormControl) {
    return this.customerBasicForm.valid ? null : { customerInfo: { valid: false, message: "customerForm fields are invalid"} };
  }

}
