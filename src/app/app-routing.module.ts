import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@modules/authentication/guards/auth.guard';

/**Main Componenets**/
import { LoginComponent, MainMenuComponent, TaxesComponent } from '@modules/index';

/**Secondary Components**/
import { SideBarComponent } from '@modules/main-menu/side-bar/side-bar.component';
import { MenuBarComponent } from '@modules/main-menu/menu-bar/menu-bar.component';
import { TaxComponent } from '@modules/taxes/tax/tax.component';
import { TaxListComponent } from '@modules/taxes/tax-list/tax-list.component';
import { NotFoundComponent } from './modules/not-found/not-found.component';
import { CustomersComponent } from './modules/customers/customers.component';
import { CustomerComponent } from './modules/customers/customer/customer.component';
import { CustomerListComponent } from './modules/customers/customer-list/customer-list.component';
import { ProductsComponent } from './modules/products/products.component';
import { ProductComponent } from './modules/products/product/product.component';
import { ProductListComponent } from './modules/products/product-list/product-list.component';

const routes: Routes = [
  { 
    path: '', 
    component: MainMenuComponent, canActivate: [AuthGuard],
    children: [
      { path: 'taxes', component: TaxesComponent, canActivate: [AuthGuard] },
      { path: 'customers', component: CustomersComponent, canActivate: [AuthGuard] },
      { path: 'products', component: ProductsComponent, canActivate: [AuthGuard] }
      //to send parameters between components
      // { path: 'taxes/:idTax', component: TaxComponent, canActivate: [AuthGuard] }
    ]
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'register', 
    component: LoginComponent //RegisterComponent
  },
  { 
    path: '**', 
    component: NotFoundComponent //redirectTo: '' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [
  LoginComponent,
  MainMenuComponent,
  TaxesComponent,
  TaxComponent,
  TaxListComponent,
  SideBarComponent,
  MenuBarComponent,
  NotFoundComponent,
  CustomersComponent,
  CustomerComponent,
  CustomerListComponent,
  ProductsComponent,
  ProductComponent,
  ProductListComponent
]
