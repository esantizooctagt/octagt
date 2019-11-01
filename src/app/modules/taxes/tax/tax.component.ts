import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Tax } from '@app/_models/index';
import { FormBuilder, Validators } from '@angular/forms';

// to send parameters between components
// import { ActivatedRoute } from '@angular/router';
// import { TaxService } from "@app/services";
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
  //to send parameters between components
  // public taxId;

  constructor(
    private fb: FormBuilder
    // to send parameters between components
    // private taxService: TaxService,
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
    //to send parameters between components
    // let id = this.route.snapshot.paramMap.get('idTax');
    // if (id != undefined) {
    //   this.taxId = id;
    //let tokenId = this.authService.tokenId();
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
    console.log(this.taxForm.value);
  }
}
