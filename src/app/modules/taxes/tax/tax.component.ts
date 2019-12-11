import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Tax } from '@app/_models/index';
import { FormBuilder, Validators } from '@angular/forms';
import { TaxService } from "@app/services";
import { AuthService } from '@core/services';
import { Router } from '@angular/router';
import { MonitorService } from "@shared/monitor.service";
import { AlertService  } from "@shared/alert";
// import { decimalValueValidator } from "@app/validators";

// to send parameters between components
// import { ActivatedRoute } from '@angular/router';
// import { AuthService } from '@core/services';

@Component({
  selector: 'app-tax',
  templateUrl: './tax.component.html',
  styleUrls: ['./tax.component.css']
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
  companyId: string='';
  // to send parameters between components
  // public taxId;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private taxService: TaxService,
    private router: Router,
    private data: MonitorService,
    private alertService: AlertService 
    // to send parameters between components
    // private authService: AuthService,
    // private route: ActivatedRoute
  ) { }

  taxForm = this.fb.group({
    Tax_Id: [''],
    CompanyId: [''],
    Name: ['', [Validators.required, Validators.minLength(3)]],
    Percentage: ['', [Validators.required, Validators.max(99.90), Validators.min(0.01), Validators.maxLength(5)]],
    Include_Tax: [0],
    Status: [0]
  })
  
  ngOnInit() {    
    this.companyId = this.authService.companyId();  
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
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    if (changes.tax.currentValue != undefined) {
      let taxResult = changes.tax.currentValue;
      let tokenValue = this.authService.currentToken();
      this.taxService.getTax(taxResult.Tax_Id, tokenValue).subscribe((res: any) => {
        if (res != null) {
          this.taxForm.setValue({
            Tax_Id: res.Tax_Id,
            Name: res.Name,
            CompanyId: res.Company_Id,
            Percentage: res.Percentage,
            Include_Tax: res.Include_Tax,
            Status: res.Status
          });  
        }
      })
    }
  }

  onSubmit(){
    let taxId = this.taxForm.value.Tax_Id;
    let tokenValue = this.authService.currentToken();
    this.submitted = true;
    if (taxId !== '' && taxId !== null) {  
      let perc = +this.taxForm.value.Percentage;
      this.taxForm.controls["Percentage"].setValue(perc);
      let dataForm = this.taxForm.value;
      delete dataForm.Tax_Id; 
      delete dataForm.CompanyId;
      this.taxService.updateTax(taxId, tokenValue, dataForm)
        .subscribe(
          response =>  {
            this.submitted = false;
            this.taxForm.reset({Include_Tax:false, Status:0});
            this.data.changeData('change');
            setTimeout( () => {
              this.alertService.success('Tax created successful');
            }, 2000);
          },
          error => { 
            this.alertService.error('Error ! ' + error);
          }
        );
    } else {
      let perc = +this.taxForm.value.Percentage;
      this.taxForm.controls["Percentage"].setValue(perc);
      let dataForm = this.taxForm.value;
      delete dataForm.Tax_Id;
      dataForm.CompanyId = this.companyId;
      this.taxService.postTax(tokenValue, dataForm)
        .subscribe(
          response => {
            this.submitted = false;
            this.taxForm.reset({Include_Tax:false, Status:0});
            this.data.changeData('change');
            setTimeout( () => {
              this.alertService.success('Tax updated successful');
            }, 2000);
          },
          error => { 
            this.alertService.error('Error ! ' + error);
          }
        );
    }
  }

  onCancel(){
    this.submitted = true;
    this.taxForm.reset({Include_Tax:false, Status:0});
    this.data.changeData('change');
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