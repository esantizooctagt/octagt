import { Component, OnInit } from '@angular/core';
import { ConfirmValidParentMatcher } from '@app/validators';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@core/services';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { StoreDocto } from '@app/_models';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { StoresService, DocumentService } from '@app/services';

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
  stores: StoreDocto[]=[];
  filteredStores: Observable<StoreDocto[]>;
  
  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private storeService: StoresService,
    private documentService: DocumentService,
    private authService: AuthService
  ) { }

  documentForm = this.fb.group({
    DocumentId: [''],
    StoreId: ['', Validators.required],
    Name: ['', [Validators.required, Validators.maxLength(50), Validators.minLength(2)]],
    Prefix: ['', Validators.maxLength(5)],
    Next_Number: [0, [Validators.required, Validators.min(1), Validators.max(999999999999999), Validators.pattern("^[0-9]{0,15}$")]],
    Sufix: ['', Validators.maxLength(5)],
    Type: ['', Validators.required],
    Status: [1]
  })

  ngOnInit() {
    this.companyId = this.authService.companyId();
    this.userId = this.authService.userId();
    this.storeService.getStoresDoctos(this.companyId).subscribe((res: any) => {
      if (res != null){
        this.stores = res;
      }
    });
    this.filteredStores = this.documentForm.get('StoreId').valueChanges
      .pipe(
        startWith(''),
        map(store => typeof store === 'string' ? store : store.Name),
        map(store => store ? this._filter(store) : this.stores.slice())
      );
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

  displayStore(store?: StoreDocto): string | undefined {
    return store ? store.Name : undefined;
  }

  private _filter(value: string): StoreDocto[] {
    let filterValue: string = '';
    filterValue = value.toLowerCase();
    return this.stores.filter(store => store.Name.toLowerCase().indexOf(filterValue) === 0);
  }

  getDocuments(value: StoreDocto){
    this.documentService.getDocumentStore(value.StoreId).subscribe((res: any) => {
      if (res != null){
        this.documentForm.patchValue({
          DocumentId: res.DocumentId,
          Name: res.Name,
          Prefix: res.Prefix,
          Sufix: res.Sufix,
          Next_Number: res.Next_Number,
          Type: res.Type,
          Status: res.Status
        })
      }else{
        this.documentForm.patchValue({
          DocumentId: '',
          Name: '',
          Prefix: '',
          Sufix: '',
          Next_Number: '',
          Type: 'sales',
          Status: 1
        })
      }
    }, 
    error => {
      this.documentForm.patchValue({
        DocumentId: '',
        Name: '',
        Prefix: '',
        Sufix: '',
        Next_Number: '',
        Type: 'sales',
        Status: 1
      });
    });
  }

  onCancel(){
    this.documentForm.reset({StoreId:'', DocumentId:'', Name:'', Prefix:'', Sufix:'', Next_Number:0, Type:'sales', Status:1});
  }

  onSubmit(){
    if (!this.documentForm.valid){
      return;
    }
    if (typeof this.documentForm.value.StoreId === 'string'){
      this.openDialog('Documents', 'You must select a valid Store', false, true, false);
      return;
    }
    if (this.documentForm.touched){
      this.loading = true;
      let info = this.documentForm.value;
      let document =  {
        "DocumentId": info.DocumentId,
        "StoreId": info.StoreId.StoreId,
        "CompanyId": this.companyId,
        "Name": info.Name,
        "Sufix": info.Sufix,
        "Prefix": info.Prefix,
        "Next_Number": info.Next_Number,
        "Type": info.Type,
        "UserId": this.userId,
        "Status": info.Status
      }
      this.documentService.updateDocument(document).subscribe((res: any) => {
        if (res !=null) {
          this.loading =false;
          this.openDialog('Documents', 'Document updated successful', true, false, false);
          this.documentForm.reset({StoreId:'', DocumentId:'', Name:'', Prefix:'', Sufix:'', Next_Number:0, Type:'sales', Status:1});
        }
      },
      error => { 
        this.loading = false;
        this.openDialog('Error !', error.Message, false, true, false);
      });
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