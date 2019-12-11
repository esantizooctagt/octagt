import { Component, OnInit } from '@angular/core';
import { Customer } from '@app/_models';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {

  public clickedCustomer: Customer;
  constructor() { }

  ngOnInit() {
  }

  childCustomerClicked(customer: Customer) {
    this.clickedCustomer = customer;
  }
}
