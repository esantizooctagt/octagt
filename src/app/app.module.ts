import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// services
import { InterceptorService } from '@core/services/interceptor.service';
// import { UserService } from '@modules/authentication/services/user.service';
// import { TaxService } from '@app/services';

// helpers
import { JwtInterceptor, ErrorInterceptor } from '@app/core/interceptors';

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { AlertComponent } from '@shared/alert/alert.component';
import { SearchComponent } from '@shared/search/search.component';
import { PaginationComponent } from '@shared/pagination/pagination.component';
import { SpinnerComponent } from '@shared/spinner/spinner.component';
import { AppSpinnerDirective } from '@shared/app-spinner.directive';

@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    AlertComponent,
    SearchComponent,
    PaginationComponent,
    SpinnerComponent,
    AppSpinnerDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule
  ],
  providers: [
        InterceptorService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  entryComponents: [
    SpinnerComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
