import { Component, Input, OnInit, forwardRef  } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-typeahead',
  templateUrl: './typeahead.component.html',
  styleUrls: ['./typeahead.component.scss'],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TypeaheadComponent),
      multi: true
    },
    {
     provide: NG_VALIDATORS,
     useExisting: forwardRef(() => TypeaheadComponent),
     multi: true
   }
  ]
})
export class TypeaheadComponent implements OnInit, ControlValueAccessor, Validator {
  showDropDown = false;
  setValue: string='';
  code: string='';
  name: string='';
  isDisabled: boolean=false;

  @Input() dataSource: string[]=[];
  @Input() dropDownName: string='';
  @Input() requiredValue: boolean=false;
  onChange = (_:any) => { }
  onTouch = () => { }
  public loading:boolean = false;
  get fDropDown() { return this.frmSearch.controls; }
  
  constructor(private fb: FormBuilder) {}

  frmSearch = this.fb.group({
    searchList: [null]
  });

  validate(c: AbstractControl): ValidationErrors | null{
    return this.frmSearch.valid ? null : { invalidForm: {valid: false, message: "frmSearch fields are invalid"}};
  }

  toggleDropDown(){
    this.showDropDown =!this.showDropDown;
  }

  toggleDropDownValue(){
    this.showDropDown =!this.showDropDown;
    this.verifyDropDown();
  }

  onKeydown($event){
    if($event.key == 'Backspace'){
      this.verifyDropDown();
    }
  }

  ngOnInit(){
    if (this.requiredValue) {
      this.frmSearch.controls['searchList'].setValidators([Validators.required]);
    }
  }

  selectValue(value, code){
    this.frmSearch.patchValue({"searchList":value});
    this.showDropDown = false;
    this.setValue = JSON.parse('{"c":"'+code+'", "n":"'+value+'"}');
    this.code = code;
    this.name = value;
    this.onTouch();
    this.onChange(this.setValue);
  }

  verifyDropDown(){
    let entro:boolean=false;
    this.dataSource.filter(resp => {
      if (resp['n'] === this.frmSearch.value.searchList) {
        this.setValue = JSON.parse('{"c":"'+resp['c']+'", "n":"'+resp['n']+'"}');
        this.frmSearch.patchValue({"searchList":resp['n']});
        this.code = resp['c'];
        this.name = resp['n'];
        this.onTouch();
        this.onChange(this.setValue);
        entro =true;
        return;
      }
    });
    if (entro == false){
      this.code = '';
      this.name = '';
      this.setValue = '';
      this.onTouch();
      this.onChange(this.setValue);
      if (this.frmSearch.value.searchList !== ''){
        this.frmSearch.controls['searchList'].setErrors({'invalid': true});
      } else{
        if (this.requiredValue) {
          this.frmSearch.controls['searchList'].setErrors({'required': true});
        }
      }
    }
  }

  getSearchValue(){
    return this.frmSearch.value.searchList;
  }

  writeValue(value: any) {
    if (value){
      let data = JSON.parse(value);
      this.code = data.c;
      this.name = data.n;
      this.setValue = value;
      this.frmSearch.patchValue({"searchList":this.name});
    } else {
      this.setValue = '';
      this.code = '';
      this.name = '';
      this.frmSearch.controls['searchList'].setValue('');
      this.frmSearch.controls['searchList'].setErrors(null);
      this.frmSearch.controls['searchList'].markAsUntouched();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any):void {
    this.onBlur = fn;
  }

  onBlur(){
    this.showDropDown = false;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  //   this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }
}
