import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// services
import { NgxImageCompressService } from 'ngx-image-compress';

// helpers interceptors jwt, errors, cache
import { JwtInterceptor, ErrorInterceptor, CacheInterceptor } from '@app/core/interceptors';

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { AlertComponent } from '@shared/alert/alert.component';
import { SearchComponent } from '@shared/search/search.component';
import { PaginationComponent } from '@shared/pagination/pagination.component';
import { SpinnerComponent } from '@shared/spinner/spinner.component';
import { CropperComponent } from '@shared/cropper/cropper.component';
import { TypeaheadComponent } from '@shared/typeahead/typeahead.component';

// Directives
import { AppSpinnerDirective } from '@shared/app-spinner.directive';
import { ClickOutsideDirective } from '@shared/clickoutside.directive';

// Custom Pipes
import { SearchFilterPipe } from '@shared/filterpipe';
import { FindrecordComponent } from '@shared/findrecord/findrecord.component';
import { CustomerbasicComponent } from './shared/customerbasic/customerbasic.component';

@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    AlertComponent,
    SearchComponent,
    PaginationComponent,
    SpinnerComponent,
    AppSpinnerDirective,
    CropperComponent,
    TypeaheadComponent,
    ClickOutsideDirective,
    SearchFilterPipe,
    FindrecordComponent,
    CustomerbasicComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule
  ],
  providers: [
    NgxImageCompressService,
    // { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  entryComponents: [
    SpinnerComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
