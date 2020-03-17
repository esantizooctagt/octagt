import { Component, OnInit } from '@angular/core';
import { Customer } from '@app/_models';
import { delay } from 'rxjs/operators';
import { RolesService } from '@app/services';
import { AuthService } from '@app/core/services';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {

  public clickedCustomer: Customer;
  access: Subscription;
  loading: boolean =false;

  constructor(
    private authService: AuthService,
    private roleService: RolesService,
    private router: Router
  ) { }

  ngOnInit() {
    let isAdmin = this.authService.isAdmin();
    let roleId = this.authService.roleId();
    if (roleId != '' && isAdmin != 1){
      this.access = this.roleService.getAccess(roleId, 'Customers').subscribe(res => {
        if (res != null){
          if (res.Value === 0){
            this.router.navigate(['/']);
          }
        }
      });
    }
  }

  childCustomerClicked(customer: Customer) {
    this.clickedCustomer = customer;
  }

  ngOnDestroy() {
    if (this.access != undefined){
      this.access.unsubscribe();
    }
  }
}
