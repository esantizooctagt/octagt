import { Component, OnInit } from '@angular/core';
import { Product } from '@app/_models';
import { delay } from 'rxjs/operators';
import { RolesService } from '@app/services';
import { AuthService } from '@app/core/services';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  public clickedProduct: Product;
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
      this.access = this.roleService.getAccess(roleId, 'Products').subscribe(res => {
        if (res != null){
          if (res.Value === 0){
            this.router.navigate(['/']);
          }
        }
      });
    }
  }

  childProductClicked(product: Product) {
    this.clickedProduct = product;
  }

  ngOnDestroy() {
    if (this.access != undefined){
      this.access.unsubscribe();
    }
  }
  
}
