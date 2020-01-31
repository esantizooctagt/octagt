import { Component, OnInit } from '@angular/core';
import { Customer } from '@app/_models';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {

  public clickedCustomer: Customer;
  loading: boolean =false;

  constructor() { }

  ngOnInit() {
  }

  childCustomerClicked(customer: Customer) {
    this.clickedCustomer = customer;
  }

  displayLoading(event){
    if (event === 'display') {
      setTimeout(() => {
        delay(50);
        this.loading = true;
      });
    } else {
      this.loading = false;
    }
  }
}
