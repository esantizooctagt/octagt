import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@modules/authentication/guards/auth.guard';

/**Componenets**/
import { LoginComponent, HomeComponent } from '@modules/index';

const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent, canActivate: [AuthGuard] 
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'register', 
    component: LoginComponent //RegisterComponent
  },
  { path: '**', redirectTo: '' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
