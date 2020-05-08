import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Tax } from '@app/_models';
import { FormBuilder, Validators } from '@angular/forms';
import { TaxService, CompanyService } from "@app/services";
import { AuthService } from '@core/services';
import { Router } from '@angular/router';
import { MonitorService } from "@shared/monitor.service";
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { Subscription, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';

@Component({
  selector: 'app-tax',
  templateUrl: './tax.component.html',
  styleUrls: ['./tax.component.scss']
})
export class TaxComponent implements OnInit {
  @Input() tax: Tax;

  get Name(){
    return this.taxForm.get('Name');
  }
  get Percentage(){
    return this.taxForm.get('Percentage');
  }

  message$: Observable<string>;
  tax$: Observable<Tax>;
  taxSave$: Observable<any>;
  displayForm: boolean = true;
  message: string='';
  companyId: string='';
  country: string='';
  subsTaxes: Subscription;
  savingTax: boolean=false;

  //variable to handle errors on inputs components
  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private taxService: TaxService,
    private companyService: CompanyService,
    private spinnerService: SpinnerService,
    private router: Router,
    private data: MonitorService,
    private dialog: MatDialog
  ) { }

  taxForm = this.fb.group({
    TaxId: [''],
    CompanyId: [''],
    Name: ['', [Validators.required, Validators.minLength(3)]],
    Percentage: ['', [Validators.required, Validators.max(99.90), Validators.min(0.01), Validators.maxLength(5)]],
    Include_Tax: [0],
    To_Go:[0],
    Status: [1]
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

  ngOnInit() {    
    this.companyId = this.authService.companyId();
    this.country = this.authService.country();
    this.message$ = this.data.monitorMessage;
    this.onValueChanges();
  }

  getErrorMessage(component: string) {
    if (component === 'Name'){
      return this.Name.hasError('required') ? 'You must enter a value' :
          this.Name.hasError('minlength') ? 'Minimun length 3' :
              '';
    }
    if (component === 'Percentage'){
      return this.Percentage.hasError('required') ? 'You must enter a value' :
          this.Percentage.hasError('min') ? 'Minimun value 0.01' :
            this.Percentage.hasError('max') ? 'Maximun value 99.90':
              this.Percentage.hasError('pattern') ? 'Incorrect value':
                '';
    }
  }

  onValueChanges(): void {
    this.subsTaxes = this.taxForm.valueChanges.subscribe(val=>{
      if (val.Status === true) {
        this.taxForm.controls["Status"].setValue(1);
      }
      if (val.Status === false){
        this.taxForm.controls["Status"].setValue(0);
      }
      if (val.Include_Tax === true) {
        this.taxForm.controls["Include_Tax"].setValue(1);
      }
      if (val.Include_Tax === false) {
        this.taxForm.controls["Include_Tax"].setValue(0);
      }
      if (val.To_Go === true){
        this.taxForm.controls['To_Go'].setValue(1);
      }
      if (val.To_Go === false){
        this.taxForm.controls['To_Go'].setValue(0);
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    if (changes.tax.currentValue != undefined) {
      var spinnerRef = this.spinnerService.start("Loading Tax..");
      let taxResult = changes.tax.currentValue;
      this.taxForm.reset({Include_Tax:0, To_To: 0, Status:1, Name:'', Percentage:'', CompanyId:'', TaxId:''});
      this.tax$ = this.taxService.getTax(taxResult.Tax_Id, this.companyId).pipe(
        tap(res => {
          if (res != null) {
            this.taxForm.setValue({
              TaxId: res.Tax_Id,
              Name: res.Name,
              CompanyId: res.Company_Id,
              Percentage: res.Percentage,
              Include_Tax: res.Include_Tax,
              To_Go: res.To_Go,
              Status: res.Status
            });
          }
          this.spinnerService.stop(spinnerRef);
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog('Error !', err.Message, false, true, false);
          return throwError(err || err.message);
        })
      );
    } else {
      this.taxForm.reset({Include_Tax:0, To_Go:0, Status:1, Name:'', Percentage:'', CompanyId:'', TaxId:''});
    }
  }
  
  onSubmit(){
    if (this.taxForm.invalid) {
      return;
    }
    if (this.taxForm.touched){
      let taxId = this.taxForm.value.TaxId;
      var spinnerRef = this.spinnerService.start("Saving Tax..");
      let userId = this.authService.userId();
      if (taxId !== '' && taxId !== null) {  
        let perc = +this.taxForm.value.Percentage;
        this.taxForm.controls["Percentage"].setValue(perc);
        let dataForm =  { 
          "Name": this.taxForm.value.Name,
          "Percentage": this.taxForm.value.Percentage,
          "Include_Tax": this.taxForm.value.Include_Tax,
          "To_Go": this.taxForm.value.To_Go,
          "UserId": userId,
          "Status": this.taxForm.value.Status
        }
        this.taxSave$ = this.taxService.updateTax(taxId, dataForm).pipe(
          tap(res => { 
            this.savingTax = true;
            this.spinnerService.stop(spinnerRef);
            this.taxForm.reset({Include_Tax:0, To_Go:0, Status:1, Name:'', Percentage:'', CompanyId:'', TaxId:''});
            this.data.changeData('taxes');
            this.openDialog('Taxes', 'Tax updated successful', true, false, false);
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.savingTax = false;
            this.openDialog('Error !', err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      } else {
        let perc = +this.taxForm.value.Percentage;
        this.taxForm.controls["Percentage"].setValue(perc);
        let dataForm = { 
          "CompanyId": this.companyId,
          "Name": this.taxForm.value.Name,
          "Percentage": this.taxForm.value.Percentage,
          "Include_Tax": this.taxForm.value.Include_Tax,
          "To_Go": this.taxForm.value.To_Go,
          "UserId": userId,
          "Status": this.taxForm.value.Status
        }
        this.taxSave$ = this.taxService.postTax(dataForm).pipe(
          tap(res => { 
            this.savingTax = true;
            this.spinnerService.stop(spinnerRef);
            this.taxForm.reset({Include_Tax:0, To_Go:0, Status:1, Name:'', Percentage:'', CompanyId:'', TaxId:''});
            this.data.changeData('taxes');
            this.openDialog('Taxes', 'Tax created successful', true, false, false);
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.savingTax = false;
            this.openDialog('Error !', err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      }
    }
  }

  onCancel(){
    this.taxForm.reset({Include_Tax:0, To_Go: 0, Status:1, Name:'', Percentage:'', CompanyId:'', TaxId:''});
  }

  // allow only digits and dot
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

  ngOnDestroy() {
    this.subsTaxes.unsubscribe();
  }

}