import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmValidParentMatcher } from '@app/validators';
import { UserService } from "@app/services";
import { map, catchError, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '@core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss']
})
export class ResetComponent implements OnInit {
  resetForm: FormGroup;

  user$:Observable<any>;
  userReset$:Observable<any>;
  resetId:string = '';
  userId:string = '';
  loading = false;
  hide = true;
  hideconf = true;
  error = '';

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private route: ActivatedRoute,
    private usersService: UserService,
    private router: Router,
    private dialog: MatDialog
  ) { 
    if (this.authService.currentUserValue) { 
      this.router.navigate(['/']);
    }

    this.resetForm = this.formBuilder.group({
      Passwords : this.formBuilder.group({
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
        confpassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]]
      }, {validator: this.checkPasswords})
    });
  }

  get f() { return this.resetForm.controls; }

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

  ngOnInit(): void {
    this.resetId = this.route.snapshot.paramMap.get('idReset');
    this.user$ = this.usersService.getResetCode(this.resetId).pipe(
      map((result: any) => { 
        if (result != null){
          if (result.Code == 100){
            this.userId = result.User_Id;
          }
        }
        if (this.userId == '') { this.router.navigate(['/']); }
        return result; 
      })
    );
  }

  checkPasswords(fb: FormGroup) {
    let confirmPswrdCtrl = fb.get('confpassword');
    if(confirmPswrdCtrl.errors === null || 'notSame' in confirmPswrdCtrl.errors){
      if(fb.get('password').value !== confirmPswrdCtrl.value)
        confirmPswrdCtrl.setErrors({notSame:true});
      else
        confirmPswrdCtrl.setErrors(null);
    }
  }

  onSubmit() {
    if (this.resetForm.invalid) {
        return;
    }
    if (this.resetForm.touched){
      var spinnerRef = this.spinnerService.start("Reseting Password...");
      if (this.userId !== '') {  
        let dataForm =  {
          "Password": this.resetForm.get('Passwords.password').value
        }
        this.userReset$ = this.usersService.putResetPass(this.userId, dataForm).pipe(
          tap((res: any) => { 
            if (res.Code == 200){
              this.spinnerService.stop(spinnerRef);
              this.openDialog('Users', 'Password reset successful', true, false, false);
              this.router.navigate(['/login']);
            } else {
              this.spinnerService.stop(spinnerRef);
              this.openDialog('Users', 'The new password must be different', false, true, false);
            }
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.openDialog('Error !', err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      }
    }
  }

}
