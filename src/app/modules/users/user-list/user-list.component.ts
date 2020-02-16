import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '@core/services';
import { User } from '@app/_models';
import { UserService } from "@app/services";
import { MonitorService } from "@shared/monitor.service";
import { delay } from 'q';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  @Output() userSelected = new EventEmitter<User>();
  @Output() modLoading = new EventEmitter<string>();
  public length: number = 0;
  public pageSize: number = 10;
  public users: User[] = [];
  public pages: number[];
  public listView:boolean=true;
  public onError: string='';

  private _currentPage: number = 1;
  private _currentSearchValue: string = '';

  companyId: string = '';
  message: string;
  loading = false;
  lastUser: User;
  deleted: boolean = false;
  displayYesNo: boolean = false;

  constructor(
    private authService: AuthService,
    private data: MonitorService,
    private userService: UserService,
    private dialog: MatDialog
  ) { }

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

  ngOnInit() {
    this.modLoading.emit('display');
    this.companyId = this.authService.companyId();
    this.loadUsers(this._currentPage, this.pageSize, this._currentSearchValue);
    this.data.monitorMessage
      .subscribe((message: any) => {
        if (message === 'users') {
          this.message = message;
          this.loadUsers(this._currentPage, this.pageSize, this._currentSearchValue);
        }
      });
  }

  loadUsers(crPage, crNumber, crValue) {
    this.onError = '';
    let data = "companyId=" + this.companyId + "&currPage=" + crPage + "&perPage=" + crNumber + (crValue === '' ? '' : '&searchValue=' + crValue);

    this.userService.getUsers(data).subscribe((res: any) => {
      if (res != null) {
        this.users = res.users;
        this.pages = Array(res.pagesTotal.pages).fill(0).map((x, i) => i);
        this.length = res.pagesTotal.count;
        this.modLoading.emit('none');
      }
    },
    error => {
      this.onError = error.Message;
      this.modLoading.emit('none');
    });
  }

  public filterList(searchParam: string): void {
    this._currentSearchValue = searchParam;
    this.loadUsers(
      this._currentPage,
      this.pageSize,
      this._currentSearchValue
    );
  }

  onSelect(user: User) {
    if (this.lastUser != user){
      this.userSelected.emit(user);
      this.lastUser = user;
    } else {
      let defUser: User;
      (async () => {
        this.userSelected.emit(defUser);
        await delay(20);
        this.userSelected.emit(user);
      })();
    }
    window.scroll(0,0);
    //to send parameters between components
    // this.router.navigate(['/taxes', tax.Tax_Id]);
  }

  onDelete(user: User) {
    this.displayYesNo = true;

    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: 'User', 
      message: 'Are you sure to delete this User?', 
      success: false, 
      error: false, 
      warn: false,
      ask: this.displayYesNo
    };
    dialogConfig.width ='280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined){
        this.deleted = result;
        if (this.deleted){
          let delUser: User;
          this.loading = true;
          this.deleted = false; 
          this.userService.deleteUser(user.User_Id).subscribe(
            response => {
              this.userSelected.emit(delUser);
              this.loadUsers(
                this._currentPage,
                this.pageSize,
                this._currentSearchValue
              );
              this.loading = false;
              window.scroll(0,0);
              this.displayYesNo = false;
              this.openDialog('User', 'User deleted successful', true, false, false);
              // this._snackBar.open('Tax deleted successful', 'Close', {
              //   duration: 3000,
              //   panelClass: 'style-succes'
              // });
            },
            error => {
              this.loading = false;
              this.displayYesNo = false;
              this.openDialog('Error ! ', error.Message, false, true, false);
              // this._snackBar.open('Error ! ' + error.Message, 'Close', {
              //   duration: 3000,
              //   panelClass: 'style-error'
              // });
            });
        }
      }
    });
  }

  public goToPage(page: number, elements: number): void {
    if (this.pageSize != elements){
      this.pageSize = elements;
      this._currentPage = 1;
    } else {
      this._currentPage = page+1;
    }
    this.loadUsers(
      this._currentPage,
      this.pageSize,
      this._currentSearchValue
    );
  }

  public setView(value){
    if (value === 'list'){
      this.listView = true;
    } else {
      this.listView = false;
    }
  }

  trackById(index: number, item: User) {
    return item.User_Id;
  }

}
