import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Tax } from '@app/_models';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { TaxService, CompanyService } from "@app/services";
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
  // to send parameters between components
  // public taxId;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private taxService: TaxService,
    private companyService: CompanyService,
    private router: Router,
    private data: MonitorService,
    private alertService: AlertService 
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
  
  ngOnInit() {    
    this.companyId = this.authService.companyId();
    this.companyService.getCompany(this.companyId).subscribe((res: any) => {
      if (res != null) {
        this.country = res.Country;
      }
    },
    error => { 
      this.alertService.error('Error ! ' + error.Message);
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
      let taxResult = changes.tax.currentValue;
      this.taxForm.reset({Include_Tax:false, To_To: false, Status:1, Name:'', Percentage:'', CompanyId:'', TaxId:''});
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
      },
      error => { 
        this.alertService.error('Error ! ' + error.Message);
      })
    }
  }
  
  onSubmit(){
    // stop here if form is invalid
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
            this.alertService.success('Tax created successful');
            this.submitted = false;
            this.loading = false;
            this.taxForm.reset({Include_Tax:false, To_Go:false, Status:1, Name:'', Percentage:'', CompanyId:'', TaxId:''});
            this.data.changeData('taxes');
          },
          error => { 
            this.loading = false;
            this.alertService.error('Error ! ' + error.Message);
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
            this.alertService.success('Tax updated successful');
            this.submitted = false;
            this.loading = false;
            this.taxForm.reset({Include_Tax:false, To_Go: false, Status:1, Name:'', Percentage:'', CompanyId:'', TaxId:''});
            this.data.changeData('taxes');
          },
          error => { 
            this.loading = false;
            this.alertService.error('Error ! ' + error.Message);
          }
        );
    }
  }

  onCancel(){
    this.submitted = true;
    this.taxForm.reset({Include_Tax:false, To_Go: false, Status:1, Name:'', Percentage:'', CompanyId:'', TaxId:''});
    this.data.changeData('taxes');
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