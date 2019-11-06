import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Tax } from '@app/_models/index';
import { FormBuilder, Validators } from '@angular/forms';
import { TaxService } from "@app/services";
import { AuthService } from '@core/services';
import { Router } from '@angular/router';
import { MonitorService } from "@shared/monitor.service";
import { AlertService  } from "@shared/alert";

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
    Company_Id: [''],
    Name: ['', [Validators.required, Validators.minLength(3)]],
    Percentage: [''],
    Include_Tax: [''],
    Status: ['']
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
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    if (changes.tax.currentValue != undefined) {
      let taxResult = changes.tax.currentValue;
      this.taxForm.setValue({
        Tax_Id: taxResult.Tax_Id,
        Name: taxResult.Name,
        Company_Id: taxResult.Company_Id,
        Percentage: taxResult.Percentage,
        Include_Tax: taxResult.Include_Tax,
        Status: taxResult.Status
      });
    }
  }

  onSubmit(){
    let taxId = this.taxForm.value.Tax_Id;
    let tokenValue = this.authService.currentToken();
    this.submitted = true;
    if (taxId !== '' && taxId !== null) {  
      let dataForm = this.taxForm.value;
      delete dataForm.Tax_Id; 
      delete dataForm.Company_Id;
      this.taxService.updateTax(taxId, tokenValue, dataForm)
        .subscribe(
          response =>  {
            this.submitted = false;
            this.taxForm.reset();
            this.data.changeData('change');
            this.alertService.success('Tax created successful');
          },
          error => { 
            this.alertService.error('Error ! ' + error);
          }
        );
    } else {
      let dataForm = this.taxForm.value;
      delete dataForm.Tax_Id;
      dataForm.Company_Id = this.companyId;
      this.taxService.postTax(tokenValue, dataForm)
        .subscribe(
          response => {
            this.submitted = false;
            this.taxForm.reset();
            this.data.changeData('change');
            this.alertService.success('Tax updated successful');
          },
          error => { 
            this.alertService.error('Error ! ' + error);
          }
        );
    }
  }

  onCancel(){
    this.submitted = true;
    this.taxForm.reset();
  }
}