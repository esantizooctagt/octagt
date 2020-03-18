import { Component, OnInit } from '@angular/core';
import { Tax } from '@app/_models';
import { AuthService } from '@app/core/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-taxes',
  templateUrl: './taxes.component.html',
  styleUrls: ['./taxes.component.scss']
})
export class TaxesComponent implements OnInit {
  public clickedTax: Tax;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    let isAdmin = this.authService.isAdmin();
    let roleId = this.authService.roleId();
    if (roleId != '' && isAdmin != 1){
      this.router.navigate(['/']);
    }
  }

  childTaxClicked(tax: Tax) {
    this.clickedTax = tax;
  }

}
