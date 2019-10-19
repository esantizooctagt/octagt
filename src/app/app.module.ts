import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// services
import { InterceptorService } from '@core/services/interceptor.service';
import { UserService } from '@modules/authentication/services/user.service';

// helpers
import { JwtInterceptor, ErrorInterceptor } from '@app/core/interceptors';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from '@modules/login/login.component';
import { HomeComponent } from '@modules/home/home.component';
import { MainMenuComponent } from './modules/main-menu/main-menu.component';
import { SideBarComponent } from './modules/main-menu/side-bar/side-bar.component';
import { MenuBarComponent } from './modules/main-menu/menu-bar/menu-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    MainMenuComponent,
    SideBarComponent,
    MenuBarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
  ],
  providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
      ],
  bootstrap: [AppComponent]
})
export class AppModule { }
