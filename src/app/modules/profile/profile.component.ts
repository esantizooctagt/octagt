import { Component, OnInit } from '@angular/core';
import { User, Store } from '@app/_models';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UsersService } from "@app/services";
import { AuthService } from '@core/services';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { StoresService } from '@app/services/stores.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  stores: Store[]=[];
  companyId: string = '';
  userId: string = '';

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private authService: AuthService,
    private storeService: StoresService,
    private userService: UsersService
  ) { }

  profileForm = this.fb.group({
    UserId: [''],
    Email: [''],
    User_Name: [''],
    First_Name: [''],
    Last_Name: [''],
    Avatar: [''],
    Company_Name: [''],
    StoreId: [''],
    Password: ['']
  })

  ngOnInit() {
    this.companyId = this.authService.companyId();
    this.userId = this.authService.userId();

    this.storeService.getStores(this.companyId).subscribe((res: any) => {
      if (res != null){
        this.stores = res;
      }
    },
    error => {
      this.openDialog('Error !', error.Message, false, true, false);
    });
    this.userService.getUser(this.userId).subscribe((res: any) => {
      if (res != null){
        console.log(res);
      }
    },
    error => {
      this.openDialog('Error !', error.Message, false, true, false);
    });
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

}
