import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
//import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@core/services';
import { Tax } from '@app/_models';
import { TaxService } from "@app/services";

@Component({
  selector: 'app-tax-list',
  templateUrl: './tax-list.component.html',
  styleUrls: ['./tax-list.component.css']
})
export class TaxListComponent implements OnInit {

  @Output() childEvent = new EventEmitter<Tax>();

  public taxes: Tax[] = [];
  constructor(
    private authService: AuthService,
    private router: Router,
    //private userService: UserService,
    private taxService: TaxService
    //private toastr: ToastrService,
  ) { }

  ngOnInit() {
    this.loadTaxes();
  }

  loadTaxes(){
    let companyId = this.authService.CompanyId();
    this.taxService.getTaxes(companyId).subscribe((res: any) => {
      if (res.length > 0) {
        this.taxes = res;
      }
    },
    err => {
      console.log(err);
    });
  }

  onSelect(tax: Tax){
    this.childEvent.emit(tax);
    //to send parameters between components
    // this.router.navigate(['/taxes', tax.Tax_Id]);
  }
}
