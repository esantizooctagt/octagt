import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { User, StoreDocto } from '@app/_models';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService, StoresService } from "@app/services";
import { AuthService } from '@core/services';
import { Router } from '@angular/router';
import { MonitorService } from "@shared/monitor.service";
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { Subscription, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  @Input() user: User;

  get f(){
    return this.userForm.controls;
  }

  message$: Observable<string>;
  loading = false;
  companyId: string='';
  changesUser: Subscription;
  stores$: Observable<StoreDocto[]>;
  displayForm: boolean = true;
  availability$: Observable<any>;
  userSave$: Observable<any>;
  user$: Observable<User>;
  hide = true;
  userNameValidated: boolean = false;
  loadingUser: boolean = false;
  savingUser: boolean = false;

  //variable to handle errors on inputs components
  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private usersService: UserService,
    private storeService: StoresService,
    private router: Router,
    private data: MonitorService,
    private dialog: MatDialog
  ) { }

  userForm = this.fb.group({
    UserId: [''],
    CompanyId: [''],
    Email: ['', [Validators.required, Validators.maxLength(200), Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    UserName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
    First_Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Last_Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Password: ['',[Validators.minLength(6), Validators.maxLength(20)]],
    Avatar: [''],
    StoreId: [''],
    Is_Admin: [{value: 0, disabled: true}],
    Status: [1]
  })

  ngOnInit() {
    this.companyId = this.authService.companyId();
    this.message$ = this.data.monitorMessage;
    this.loadStores();
    this.onValueChanges();
  }

  openDialog(header: string, message: string, success: boolean, error: boolean, warn: boolean): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    // dialogConfig.disableClose = true;
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

  getErrorMessage(component: string) {
    if (component === 'Email'){
      return this.f.Email.hasError('required') ? 'You must enter an Email' :
        this.f.Email.hasError('maxlength') ? 'Maximun length 200' :
          this.f.Email.hasError('pattern') ? 'Invalid Email' :
          '';
    }
    if (component === 'UserName'){
      return this.f.UserName.hasError('required') ? 'You must enter a value' :
          this.f.UserName.hasError('minlength') ? 'Minimun length 5' :
            this.f.UserName.hasError('maxlength') ? 'Maximun length 50' :
              this.f.UserName.hasError('notUnique') ? 'Username already taken' :
              '';
    }
    if (component === 'First_Name'){
      return this.f.First_Name.hasError('required') ? 'You must enter a value' :
          this.f.First_Name.hasError('minlength') ? 'Minimun length 3' :
            this.f.First_Name.hasError('maxlength') ? 'Maximun length 100' :
              '';
    }
    if (component === 'Last_Name'){
      return this.f.Last_Name.hasError('required') ? 'You must enter a value' :
          this.f.Last_Name.hasError('minlength') ? 'Minimun length 3' :
            this.f.Last_Name.hasError('maxlength') ? 'Maximun length 100' :
              '';
    }
    if (component === 'Password'){
      return this.f.Password.hasError('minlength') ? 'Minimun length 6' :
        this.f.Password.hasError('maxlength') ? 'Maximun length 20' :
          '';
    }
  }

  onValueChanges(): void {
    this.changesUser = this.userForm.valueChanges.subscribe(val=>{
      if (val.Status === true) {
        this.userForm.controls["Status"].setValue(1);
      }
      if (val.Status === false){
        this.userForm.controls["Status"].setValue(0);
      }
      if (val.Is_Admin === true) {
        this.userForm.controls["Is_Admin"].setValue(1);
      }
      if (val.Is_Admin === false){
        this.userForm.controls["Is_Admin"].setValue(0);
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    if (changes.user.currentValue != undefined) {
      this.loading = true;
      let userResult = changes.user.currentValue;
      this.userForm.reset({UserId:'', CompanyId: '', Email: '', UserName: '', First_Name: '', Last_Name: '', Password: '', Avatar: '', StoreId: '', Is_Admin: 0, Status: 1});
      this.user$ = this.usersService.getUser(userResult.User_Id).
        pipe(
          tap(user => { 
            this.userForm.controls.UserName.disable();
            this.loading = false;
            this.userForm.setValue({
              UserId: user.User_Id,
              CompanyId: user.Company_Id,
              Email: user.Email,
              UserName: user.User_Name,
              First_Name: user.First_Name,
              Last_Name: user.Last_Name,
              Password: '',
              Avatar: '',
              StoreId: user.Store_Id,
              Is_Admin: user.Is_Admin,
              Status: user.Status
            });
          }),
          catchError(err => {
            this.loading = false;
            this.openDialog('Error !', err.Message, false, true, false);
            return throwError(err || err.Message);
          })
        );
    } else {
      this.userForm.reset({UserId:'', CompanyId: '', Email: '', UserName: '', First_Name: '', Last_Name: '', Password: '', Avatar: '', StoreId: '', Is_Admin: 0, Status: 1});
    }
  }
  
  loadStores(){
    this.stores$ = this.storeService.getStoresDoctos(this.companyId);
  }

  onSubmit(){
    if (this.userForm.invalid) {
      return;
    }
    if (this.userForm.touched){
      let userId = this.userForm.value.UserId;
      this.loading = true;
      if (userId !== '' && userId !== null) {  
        let userLoggedId = this.authService.userId();
        let dataForm =  {
          "Email": this.userForm.value.Email,
          "First_Name": this.userForm.value.First_Name,
          "Last_Name": this.userForm.value.Last_Name,
          "Password": this.userForm.value.Password,
          "StoreId": this.userForm.value.StoreId,
          "UserLogId": userLoggedId,
          "Status": this.userForm.value.Status
        }
        this.userSave$ = this.usersService.updateUser(userId, dataForm).pipe(
          tap(res => { 
            this.savingUser = true;
            this.loading = false;
            this.userNameValidated = false;
            this.userForm.controls.UserName.enable();
            this.userForm.reset({UserId:'', CompanyId: '', Email: '', UserName: '', First_Name: '', Last_Name: '', Password: '', Avatar: '', StoreId: '', Is_Admin: 0, Status: 1});
            this.data.changeData('users');
            this.openDialog('Users', 'User updated successful', true, false, false);
          }),
          catchError(err => {
            this.loading = false;
            this.savingUser = false;
            this.openDialog('Error !', err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      } else {
        let userLoggedId = this.authService.userId();
        let dataForm = { 
          "CompanyId": this.companyId,
          "Email": this.userForm.value.Email,
          "UserName": this.userForm.value.UserName,
          "First_Name": this.userForm.value.First_Name,
          "Last_Name": this.userForm.value.Last_Name,
          "Password": this.userForm.value.Password,
          "StoreId": this.userForm.value.StoreId,
          "UserLogId": userLoggedId
        }
        this.userSave$ = this.usersService.postUser(dataForm).pipe(
          tap(res => { 
            this.savingUser = true;
            this.loading = false;
            this.userNameValidated = false;
            this.userForm.controls.UserName.enable();
            this.userForm.reset({UserId:'', CompanyId: '', Email: '', UserName: '', First_Name: '', Last_Name: '', Password: '', Avatar: '', StoreId: '', Is_Admin: 0, Status: 1});
            this.data.changeData('users');
            this.openDialog('Users', 'User created successful', true, false, false);
          }),
          catchError(err => {
            this.loading = false;
            this.savingUser = false;
            this.openDialog('Error !', err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      }
    }
  }

  onCancel(){
    this.userNameValidated = false;
    this.userForm.controls.UserName.enable();
    this.userForm.reset({UserId:'', CompanyId: '', Email: '', UserName: '', First_Name: '', Last_Name: '', Password: '', Avatar: '', StoreId: '', Is_Admin: 0, Status: 1});
  }

  // allow only digits and dot
  onKeyPress(event, value): boolean { 
    const charCode = (event.which) ? event.which : event.keyCode;
    let perc: string = value.toString();
    var count = (perc.match(/[.]/g) || []).length;
    if (count  == 1) {
      if (charCode == 46) return false;
    }
    if (charCode == 46) return true;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  ngOnDestroy() {
    this.changesUser.unsubscribe();
  }

  checkUserNameAvailability(data) { 
    this.userNameValidated = false;
    if (data.target.value != ''){
      this.loadingUser = true;
      this.availability$ = this.usersService.validateUserName(data.target.value).pipe(
        tap((result: any) => { 
          this.userNameValidated = true;
          if (result.Available == 0){
            this.userForm.controls.UserName.setErrors({notUnique: true});
          }
          this.loadingUser = false;
          return result; 
        })
      );
    }
  }

}
