import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@modules/authentication/guards/auth.guard';

/**Main Componenets**/
import { LoginComponent, TaxesComponent, SalesComponent, CustomersComponent, ProductsComponent, ProfileComponent, MainNavComponent, CompanyComponent, DocumentsComponent, UsersComponent, CategoriesComponent, HelpComponent, ForgotpassComponent } from '@modules/index';

/**Secondary Components**/
import { TaxComponent } from '@modules/taxes/tax/tax.component';
import { TaxListComponent } from '@modules/taxes/tax-list/tax-list.component';
import { NotFoundComponent } from '@modules/not-found/not-found.component';
import { CustomerComponent } from '@modules/customers/customer/customer.component';
import { CustomerListComponent } from '@modules/customers/customer-list/customer-list.component';
import { ProductComponent } from '@modules/products/product/product.component';
import { ProductListComponent } from '@modules/products/product-list/product-list.component';
import { UserComponent } from '@modules/users/user/user.component';
import { UserListComponent } from '@modules/users/user-list/user-list.component';

const routes: Routes = [
  { 
    path: '', 
    component: MainNavComponent, canActivate: [AuthGuard],
    children: [
      { path: 'taxes', component: TaxesComponent, canActivate: [AuthGuard] },
      { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
      { path: 'customers', component: CustomersComponent, canActivate: [AuthGuard] },
      { path: 'products', component: ProductsComponent, canActivate: [AuthGuard] },
      { path: 'sales', component: SalesComponent, canActivate: [AuthGuard] },
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
      { path: 'documents', component: DocumentsComponent, canActivate: [AuthGuard] },
      { path: 'company', component: CompanyComponent, canActivate: [AuthGuard] },
      { path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard] },
      { path: 'help', component: HelpComponent, canActivate: [AuthGuard] }
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
    path: 'forgotpassword',
    component: ForgotpassComponent
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
  MainNavComponent,
  CompanyComponent,
  TaxesComponent,
  TaxComponent,
  TaxListComponent,
  NotFoundComponent,
  CustomersComponent,
  CustomerComponent,
  CustomerListComponent,
  ProductsComponent,
  ProductComponent,
  ProfileComponent,
  DocumentsComponent,
  ProductListComponent,
  UserComponent,
  UsersComponent,
  UserListComponent,
  SalesComponent,
  HelpComponent,
  ForgotpassComponent
]
