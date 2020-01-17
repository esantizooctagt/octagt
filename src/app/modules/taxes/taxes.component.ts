import { Component, OnInit } from '@angular/core';
import { Tax } from '@app/_models';

@Component({
  selector: 'app-taxes',
  templateUrl: './taxes.component.html',
  styleUrls: ['./taxes.component.scss']
})
export class TaxesComponent implements OnInit {

  public clickedTax: Tax;
  constructor() { }

  ngOnInit() {
  }

  childTaxClicked(tax: Tax) {
    this.clickedTax = tax;
  }
}
