import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';

import { User, Access } from '@app/_models';
import { AuthService } from '@core/services';
import { environment } from '@environments/environment';
import { RolesService, CashiersService } from '@app/services';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent implements OnInit {
  public online: boolean = true;
  companyId: string='';
  userId: string='';
  avatar: string='';
  roleId: string='';
  isAdmin: boolean=false;
  collapse: boolean=false;
  cashierId: string='';

  apps$: Observable<Access[]>;
  cashier$: Observable<any>;

  readonly imgPath = environment.bucket;

  users: User[] = [];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    public authService: AuthService,
    private roleService: RolesService,
    private dialog: MatDialog,
    private cashierService: CashiersService,
    private router: Router
    ) {
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

  ngOnInit(){
    this.companyId = this.authService.companyId();
    this.roleId = this.authService.roleId();
    this.userId = this.authService.userId();
    this.isAdmin = this.authService.isAdmin();
    if (this.authService.avatar() != '') {
      this.avatar = this.imgPath + this.authService.avatar();
    }
    this.loadAccess();
  }

  loadAccess(){
    this.apps$ = this.roleService.getApplications((this.roleId != '' ? this.roleId : 1));
  }

  logout() {
    this.cashierId = this.authService.cashier();
    if (this.cashierId != '') {
      this.cashier$ = this.cashierService.updCashier(this.cashierId).pipe(
        map((res: any) => {
          if (res != undefined) {
            if (res.Codigo === 100){
              this.authService.logout();
              this.router.navigate(['/login']);
            } else {
              this.openDialog('Cashier 2 Go', 'Something goes wrong try again', false, true, false);
            }
          } else {
            this.openDialog('Cashier 2 Go', 'Something goes wrong try again', false, true, false);
          }
        })
      )
    } else {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  OnCollapse(){
    this.collapse = !this.collapse;
  }

}
