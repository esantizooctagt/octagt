import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
//import { ToastrService } from 'ngx-toastr';
//import { FormBuilder } from '@angular/forms';
import { Tax } from '@app/_models';
import { TaxService } from "@app/services";

@Component({
  selector: 'app-tax-list',
  templateUrl: './tax-list.component.html',
  styleUrls: ['./tax-list.component.css']
})
export class TaxListComponent implements OnInit {
  public taxes: Tax[] = [];
  constructor(
    public taxService: TaxService
    //private toastr: ToastrService,
  ) { }

  ngOnInit() {
    this.loadTaxes();
  }

  loadTaxes(){
    this.taxService.getTaxes().subscribe((res: any) => {
      this.taxes = res;
      //this.parseTaxes();
      console.log(this.taxes);
    },
    err => {
      console.log(err);
    });
  }

  /*parseTaxes(){
    this.allTaxes.forEach((e) => {
      var tax = new Tax();
      tax.taxId = e.taxId;
      tax.companyId = e.compnayId;
      tax.name = e.name;
      tax.percentage = e.percentage;
      tax.include_tax = e.include_tax;
      tax.status = e.status;

      this.taxes.push(tax);
    });
  }*/
}
