import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '@core/services';
import { User } from '@app/_models';
import { UserService } from "@app/services";
import { MonitorService } from "@shared/monitor.service";
import { delay } from 'q';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  @Output() userSelected = new EventEmitter<User>();
  // @Output() modLoading = new EventEmitter<string>();
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
  message$: Observable<string>;
  users$: Observable<User[]>;
  deleteUser$: Observable<any>;
  deletingUser: boolean = false;

  constructor(
    private authService: AuthService,
    private data: MonitorService,
    private userService: UserService,
    private spinnerService: SpinnerService,
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
    // this.modLoading.emit('display');
    this.companyId = this.authService.companyId();
    this.loadUsers(this._currentPage, this.pageSize, this._currentSearchValue);
    this.message$ = this.data.monitorMessage.pipe(
      map(res => {
        this.message = 'init';
        if (res === 'users') {
          this.message = res;
          this.loadUsers(this._currentPage, this.pageSize, this._currentSearchValue);
        }
        return this.message;
      })
    );
  }

  loadUsers(crPage, crNumber, crValue) {
    this.onError = '';
    var spinnerRef = this.spinnerService.start("Loading Users...");
    let data = this.companyId + "/" + (crValue === '' ? crPage : 1) + "/" + crNumber + (crValue === '' ? '/_' : '/' + crValue);

    this.users$ = this.userService.getUsers(data).pipe(
      map((res: any) => {
        if (res != null) {
          this.pages = Array(res.pagesTotal.pages).fill(0).map((x, i) => i);
          this.length = res.pagesTotal.count;
          // this.modLoading.emit('none');
        }
        this.spinnerService.stop(spinnerRef);
        return res.users;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        // this.modLoading.emit('none');
        return this.onError;
      })
    )
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
        var spinnerRef = this.spinnerService.start("Deleting User...");
        if (this.deleted){
          let delUser: User;
          this.deleted = false; 
          this.deleteUser$ = this.userService.deleteUser(user.User_Id).pipe(
            tap(res => {
              this.userSelected.emit(delUser);
              this.spinnerService.stop(spinnerRef);
              this.displayYesNo = false;
              this.deletingUser = true;
              this.loadUsers(
                this._currentPage,
                this.pageSize,
                this._currentSearchValue
              );
              this.openDialog('User', 'User deleted successful', true, false, false);
              window.scroll(0,0);
            }),
            catchError(err => {
              this.deletingUser = false;
              this.spinnerService.stop(spinnerRef);
              this.displayYesNo = false;
              this.openDialog('Error ! ', err.Message, false, true, false);
              return throwError (err || err.message);
            })
          );
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
