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

// to send parameters between components
// import { ActivatedRoute } from '@angular/router';
// import { AuthService } from '@core/services';

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

  message: string='';
  submitted = false;
  loading = false;
  companyId: string='';
  country: string='';

  //variable to handle errors on inputs components
  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  // to send parameters between components
  // public taxId;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private taxService: TaxService,
    private companyService: CompanyService,
    private router: Router,
    private data: MonitorService,
    // private _snackBar: MatSnackBar ,
    private dialog: MatDialog
    // to send parameters between components
    // private authService: AuthService,
    // private route: ActivatedRoute
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
    this.companyService.getCompany(this.companyId).subscribe((res: any) => {
      if (res != null) {
        this.country = res.Country;
      }
    },
    error => {
      this.openDialog('Error !', error.Message, false, true, false); 
    })
    // to send parameters between components
    // let id = this.route.snapshot.paramMap.get('idTax');
    // if (id != undefined) {
    //   this.taxId = id;
    //   let tokenId = this.authService.tokenId();
    //   this.taxService.getTax('',this.taxId).subscribe((res: any) => {
    //     if (res.length > 0) {
    //       this.taxes = res;
    //       console.log(this.taxId);
    //     }
    //   },
    //   err => {
    //     console.log(err);
    //   });
    //   console.log(this.taxData);
    // }
    this.data.monitorMessage
      .subscribe((message: any) => {
        this.message = message;
      });
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
    this.taxForm.valueChanges.subscribe(val=>{
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
      this.loading = true;
      let taxResult = changes.tax.currentValue;
      this.taxForm.reset({Include_Tax:0, To_To: 0, Status:1, Name:'', Percentage:'', CompanyId:'', TaxId:''});
      this.taxService.getTax(taxResult.Tax_Id).subscribe((res: any) => {
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
        this.loading = false;
      },
      error => { 
        this.loading = false;
        this.openDialog('Error !', error.Message, false, true, false);
      })
    } else {
      this.taxForm.reset({Include_Tax:0, To_Go:0, Status:1, Name:'', Percentage:'', CompanyId:'', TaxId:''});
    }
  }
  
  onSubmit(){
    if (this.taxForm.invalid) {
      return;
    }

    let taxId = this.taxForm.value.TaxId;
    this.submitted = true;
    this.loading = true;
    if (taxId !== '' && taxId !== null) {  
      let perc = +this.taxForm.value.Percentage;
      this.taxForm.controls["Percentage"].setValue(perc);
      let dataForm =  { 
        "Name": this.taxForm.value.Name,
        "Percentage": this.taxForm.value.Percentage,
        "Include_Tax": this.taxForm.value.Include_Tax,
        "To_Go": this.taxForm.value.To_Go,
        "Status": this.taxForm.value.Status
      }
      this.taxService.updateTax(taxId, dataForm)
        .subscribe(
          response =>  {
            this.submitted = false;
            this.loading = false;
            this.openDialog('Taxes', 'Tax updated successful', true, false, false);            
            this.taxForm.reset({Include_Tax:0, To_Go:0, Status:1, Name:'', Percentage:'', CompanyId:'', TaxId:''});
            this.data.changeData('taxes');
          },
          error => { 
            this.loading = false;
            this.openDialog('Error !', error.Message, false, true, false);
          }
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
        "Status": this.taxForm.value.Status
      }
      this.taxService.postTax(dataForm)
        .subscribe(
          response => {
            // this._snackBar.open('Tax created successful', 'Close', {
            //   duration: 3000,
            //   panelClass: 'style-succes'
            // });
            // this.alertService.success('Tax updated successful');
            this.submitted = false;
            this.loading = false;
            this.openDialog('Taxes', 'Tax created successful', true, false, false);
            this.taxForm.reset({Include_Tax:0, To_Go:0, Status:1, Name:'', Percentage:'', CompanyId:'', TaxId:''});
            this.data.changeData('taxes');
          },
          error => { 
            this.loading = false;
            this.openDialog('Error !', error.Message, false, true, false);
            // this._snackBar.open('Error ! ' + error.Message, 'Close', {
            //   duration: 3000,
            //   panelClass: 'style-error'
            // });
            // this.alertService.error('Error ! ' + error.Message);
          }
        );
    }
  }

  onCancel(){
    this.submitted = true;
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

}