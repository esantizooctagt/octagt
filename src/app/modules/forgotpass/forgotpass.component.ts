import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmValidParentMatcher } from '@app/validators';

import { AuthService } from '@core/services';
import { UserService } from '@app/services';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Component({
  selector: 'app-forgotpass',
  templateUrl: './forgotpass.component.html',
  styleUrls: ['./forgotpass.component.scss']
})
export class ForgotpassComponent implements OnInit {
  forgotForm: FormGroup;
  loading = false;
  error = '';
  user$: Observable<object>;
  displayForm: boolean = true;

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private formBuilder: FormBuilder,
    private usersService: UserService,
    private router: Router,
    private authService: AuthService
  ) {
    // redirect to home if already logged in
    if (this.authService.currentUserValue) { 
      this.router.navigate(['/']);
    }
   }

  ngOnInit() {
    this.forgotForm = this.formBuilder.group({
      Email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.forgotForm.controls; }

  getErrorMessage(component: string) {
    if (component === 'Email'){
      return this.f.Email.hasError('required') ? 'You must enter an Email' :
        this.f.Email.hasError('pattern') ? 'Invalid email format':
          '';
    }
  }

  onSubmit() {
    // stop here if form is invalid
    if (this.forgotForm.invalid) {
        return;
    }

    this.loading = true;
    let email = {
      "Email": this.f.Email.value
    };
    this.user$ = this.usersService.forgotPassword(email).pipe(
      tap((data:any) => {
        if (data != null){
          this.loading = false;
          this.error = data.Message;
          this.forgotForm.reset({Email:''});
        } else {
          this.loading = false;
          this.error = data.Message;
          this.forgotForm.reset({Email:''});
        }
      }),
      catchError(err => {
        this.error = err.Message;
        this.loading = false;
        this.forgotForm.reset({Email:''});
        return throwError(err || err.message);
      })
    );
  }

}
