import { Component, OnInit } from '@angular/core';
import { Tax } from '@app/_models';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-taxes',
  templateUrl: './taxes.component.html',
  styleUrls: ['./taxes.component.scss']
})
export class TaxesComponent implements OnInit {

  public clickedTax: Tax;
  loading: boolean =false;
  
  constructor() { }

  ngOnInit() {
  }

  childTaxClicked(tax: Tax) {
    this.clickedTax = tax;
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
