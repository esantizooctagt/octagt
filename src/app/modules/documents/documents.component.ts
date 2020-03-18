import { Component, OnInit } from '@angular/core';
import { ConfirmValidParentMatcher } from '@app/validators';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@core/services';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { StoreDocto, Document } from '@app/_models';
import { StoresService, DocumentService, RolesService } from '@app/services';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';
import { Router } from '@angular/router';

interface Type {
  c: string;
  n: string;
}

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {

  get fDocuments() { return this.documentForm.controls; }
  companyId: string='';
  userId: string = '';
  loading = false;
  types: Type[]=[{"n":"sales","c":"sales"}];
  stores$: Observable<StoreDocto[]>;
  document$: Observable<Document>;
  documentSave$: Observable<any>;
  displayForm: boolean=true;
  
  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private storeService: StoresService,
    private documentService: DocumentService,
    private spinnerService: SpinnerService,
    private router: Router,
    private authService: AuthService
  ) { }

  documentForm = this.fb.group({
    DocumentId: [''],
    StoreId: ['', Validators.required],
    Name: ['', [Validators.required, Validators.maxLength(50), Validators.minLength(2)]],
    Prefix: ['', Validators.maxLength(5)],
    Next_Number: [0, [Validators.required, Validators.min(1), Validators.max(999999999999999), Validators.pattern("^[0-9]{0,15}$")]],
    Digits_Qty: [0, [Validators.required, Validators.min(3), Validators.max(15), Validators.pattern("^[0-9]{0,15}$")]],
    Sufix: ['', Validators.maxLength(5)],
    Type: ['', Validators.required],
    Status: [1]
  })

  async ngOnInit() {
    let isAdmin = this.authService.isAdmin();
    let roleId = this.authService.roleId();
    if (roleId != '' && isAdmin != 1){
      this.router.navigate(['/']);
    } else {
      this.initData()
    }
  }

  initData(){
    this.companyId = this.authService.companyId();
    this.userId = this.authService.userId();
    this.stores$ = this.storeService.getStoresDoctos(this.companyId);
  }

  getErrorMessage(component: string) {
    if(component === 'StoreId'){
      return this.fDocuments.StoreId.hasError('required') ? 'You must select a value' :
        '';
    }
    if (component === 'Name'){
      return this.fDocuments.Name.hasError('required') ? 'You must enter a value' :
        this.fDocuments.Name.hasError('minlength') ? 'Minimun length 2' :
          this.fDocuments.Name.hasError('maxlength') ? 'Maximum length 50' :
            '';
    }
    if (component === 'Prefix'){
      return this.fDocuments.Prefix.hasError('maxlength') ? 'Maximum length 5' :
        '';
    }
    if (component === 'Sufix'){
      return this.fDocuments.Sufix.hasError('maxlength') ? 'Maximum length 5' :
        '';
    }
    if (component === 'Next_Number'){
      return this.fDocuments.Next_Number.hasError('required') ? 'You must enter a value' : 
        this.fDocuments.Next_Number.hasError('max') ? 'Maximum allowed 999999999999999' :
          this.fDocuments.Next_Number.hasError('min') ? 'Minimun allowed 1' :
            this.fDocuments.Next_Number.hasError('pattern') ? 'Invalid value' :
        '';
    }
    if (component === 'Digits_Qty'){
      return this.fDocuments.Digits_Qty.hasError('required') ? 'You must enter a value' : 
        this.fDocuments.Digits_Qty.hasError('max') ? 'Maximum allowed 15' :
          this.fDocuments.Digits_Qty.hasError('min') ? 'Minimun allowed 3' :
            this.fDocuments.Digits_Qty.hasError('pattern') ? 'Invalid value' :
        '';
    }
    if (component === 'Type'){
      return this.fDocuments.Type.hasError('required') ? 'You must enter a value' :
        '';
    }
  }

  openDialog(header: string, message: string, success: boolean, error: boolean, warn: boolean): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: header, 
      message: message, 
      success: success, 
      error: error, 
      warn: warn
    };
    dialogConfig.width ='280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';
    this.dialog.open(DialogComponent, dialogConfig);
  }

  getDocuments(value: string){
    if (value === undefined) {return};
    var spinnerRef = this.spinnerService.start("Loading Document...");
    this.document$ = this.documentService.getDocumentStore(value).pipe(
      tap(res => {
        if (res != null){
          this.documentForm.patchValue({
            DocumentId: res.DocumentId,
            Name: res.Name,
            Prefix: res.Prefix,
            Sufix: res.Sufix,
            Next_Number: res.Next_Number,
            Digits_Qty: res.Digits_Qty,
            Type: res.Type,
            Status: res.Status
          });
        }else{
          this.documentForm.patchValue({
            DocumentId: '',
            Name: '',
            Prefix: '',
            Sufix: '',
            Next_Number: '',
            Digits_Qty: '',
            Type: 'sales',
            Status: 1
          });
        }
        this.spinnerService.stop(spinnerRef);
      }),
      catchError(err => {
        this.documentForm.patchValue({
          DocumentId: '',
          Name: '',
          Prefix: '',
          Sufix: '',
          Next_Number: '',
          Digits_Qty: '',
          Type: 'sales',
          Status: 1
        });
        this.spinnerService.stop(spinnerRef);
        return throwError(err || err.message);
      })
    );
  }

  onCancel(){
    this.documentForm.reset({StoreId:'None', DocumentId:'', Name:'', Prefix:'', Sufix:'', Next_Number:0, Digits_Qty: 0, Type:'sales', Status:1});
  }

  onSubmit(){
    if (!this.documentForm.valid){
      return;
    }
    if (this.documentForm.touched){
      var spinnerRef = this.spinnerService.start("Saving Document...");
      let info = this.documentForm.value;
      let document =  {
        "DocumentId": info.DocumentId,
        "StoreId": info.StoreId,
        "CompanyId": this.companyId,
        "Name": info.Name,
        "Sufix": info.Sufix,
        "Prefix": info.Prefix,
        "Next_Number": info.Next_Number,
        "Digits_Qty": info.Digits_Qty,
        "Type": info.Type,
        "UserId": this.userId,
        "Status": info.Status
      }
      this.documentSave$ = this.documentService.updateDocument(document).pipe(
        map(res => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog('Documents', 'Document updated successful', true, false, false);
          return this.documentForm.reset({StoreId:'None', DocumentId:'', Name:'', Prefix:'', Sufix:'', Next_Number:0, Digits_Qty: 0, Type:'sales', Status:1});
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog('Error !', err.Message, false, true, false);
          return throwError(err || err.message);
        })
      );
    }
  }

  onKeyPress(event, value): boolean { 
    const charCode = (event.which) ? event.which : event.keyCode;
    let perc: string = value.toString();
    var count = (perc.match(/[.]/g) || []).length;
    if (count  == 1) {
      if (charCode == 46) return false;
    }
    if (charCode == 46) return false;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

}
