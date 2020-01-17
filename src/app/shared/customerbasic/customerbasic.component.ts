import { Component, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormControl, NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

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

  get fCustomer(){
    return this.customerBasicForm.controls;
  }

  constructor(
    private fb: FormBuilder
  ) {
    this.customerBasicForm = this.fb.group({
      Customer_Id: [''],
      Name: ['', [Validators.required, Validators.minLength(3)]],
      Tax_Number: ['', [Validators.required, Validators.minLength(2)]],
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

  ngOnInit() {
    this.onValueChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onValueChanges(): void {
    this.customerBasicForm.valueChanges.subscribe(val=>{
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
    console.log(val);
    if (val === '' || val === null) { console.log('Borra datos'); this.customerBasicForm.reset({'Customer_Id':'', 'Name':'', 'Tax_Number':'', 'Is_Exent': 0, 'Reason': '', 'Status': 1}); return; }
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

  // validate(c: AbstractControl): ValidationErrors | null{
  //   // console.log("Customer Info validation", c);
  //   console.log('Customer Valid --> ' +this.customerBasicForm.valid);
  //   return this.customerBasicForm.valid ? null : { customerInfo: {valid: false, message: "customerForm fields are invalid"}};
  // }
}
