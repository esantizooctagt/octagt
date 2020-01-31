import { Component, OnInit } from '@angular/core';
import { Product } from '@app/_models';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  public clickedProduct: Product;
  loading: boolean =false;

  constructor() { }

  ngOnInit() {
  }

  childProductClicked(product: Product) {
    this.clickedProduct = product;
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
