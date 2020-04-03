import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QRCodeModule } from 'angularx-qrcode';
import { NgxEchartsModule } from 'ngx-echarts';

// services
import { NgxImageCompressService } from 'ngx-image-compress';
import { SpinnerService } from '@shared/spinner.service';

// helpers interceptors jwt, errors, cache
import { JwtInterceptor, ErrorInterceptor, CacheInterceptor } from '@app/core/interceptors';

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { AlertComponent } from '@shared/alert/alert.component';
import { SearchComponent } from '@shared/search/search.component';
import { SpinnerComponent } from '@shared/spinner/spinner.component';
import { CropperComponent } from '@shared/cropper/cropper.component';
import { DialogComponent } from '@shared/dialog/dialog.component';

// Directives
import { ClickOutsideDirective } from '@shared/clickoutside.directive';

// Custom Pipes
import { SearchFilterPipe } from '@shared/filterpipe';
import { CustomerbasicComponent } from '@shared/customerbasic/customerbasic.component';
import { LayoutModule } from '@angular/cdk/layout';
import { CategoriesComponent } from '@modules/categories/categories.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';

// import { registerLocaleData } from '@angular/common';
// import localeEs from '@angular/common/locales/es';
// import localeDe from '@angular/common/locales/es';

@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    AlertComponent,
    SearchComponent,
    SpinnerComponent,
    CropperComponent,
    ClickOutsideDirective,
    SearchFilterPipe,
    CustomerbasicComponent,
    DialogComponent,
    CategoriesComponent,
    DashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    QRCodeModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatPaginatorModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatSidenavModule,
    MatToolbarModule,
    MatMenuModule,
    MatTableModule,
    MatRadioModule,
    MatStepperModule,
    MatExpansionModule,
    MatChipsModule,
    MatSortModule,
    MatSlideToggleModule,
    DragDropModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    LayoutModule,
    NgxEchartsModule
  ],
  providers: [
    NgxImageCompressService,
    SpinnerService,
    // { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  entryComponents: [
    SpinnerComponent,
    DialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }