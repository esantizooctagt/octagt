import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule, MatPaginatorModule, MatListModule, MatIconModule, MatProgressSpinnerModule, MatCardModule, MatSnackBarModule, MatSelectModule, MatDialogModule, MatAutocompleteModule, MatSidenavModule, MatMenuModule, MatTableModule, MatRadioModule, MatStepperModule, MatExpansionModule, MatChipsModule } from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
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
import { SpinnerComponent } from '@shared/spinner/spinner.component';
import { CropperComponent } from '@shared/cropper/cropper.component';
import { DialogComponent } from './shared/dialog/dialog.component';

// Directives
import { AppSpinnerDirective } from '@shared/app-spinner.directive';
import { ClickOutsideDirective } from '@shared/clickoutside.directive';

// Custom Pipes
import { SearchFilterPipe } from '@shared/filterpipe';
import { CustomerbasicComponent } from './shared/customerbasic/customerbasic.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    AlertComponent,
    SearchComponent,
    SpinnerComponent,
    AppSpinnerDirective,
    CropperComponent,
    ClickOutsideDirective,
    SearchFilterPipe,
    CustomerbasicComponent,
    DialogComponent  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
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
    DragDropModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    LayoutModule
  ],
  providers: [
    NgxImageCompressService,
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
