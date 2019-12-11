import { Component, OnInit } from '@angular/core';
import { Product } from '@app/_models';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  public clickedProduct: Product;
  constructor() { }

  ngOnInit() {
  }

  childProductClicked(product: Product) {
    this.clickedProduct = product;
  }

}
