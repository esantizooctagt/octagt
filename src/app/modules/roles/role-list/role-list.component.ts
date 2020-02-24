import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { MonitorService } from "@shared/monitor.service";
import { Role } from '@app/_models';
import { Observable } from 'rxjs';
import { RolesService } from "@app/services";
import { AuthService } from '@core/services';
import { delay, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent implements OnInit {
  @Output() roleSelected = new EventEmitter<Role>();
  @Output() modLoading = new EventEmitter<string>();
  
  public onError: string='';
  
  companyId: string = '';
  message: string = '';
  lastRole: Role;
  deletingRole: boolean = false;
  
  deleteRole$: Observable<any>;
  message$: Observable<string>;
  roles$: Observable<Role[]>;

  constructor(
    private authService: AuthService,
    private data: MonitorService,
    private rolesService: RolesService
  ) { }

  ngOnInit() {
    this.modLoading.emit('display');
    this.companyId = this.authService.companyId();
    this.loadRoles();
    this.message$ = this.data.monitorMessage.pipe(
      map(res => {
        this.message = 'init';
        if (res === 'roles') {
          this.message = res;
          this.loadRoles();
        }
        return this.message;
      })
    );
  }

  loadRoles(){
    this.roles$ = this.rolesService.getRoles(this.companyId).pipe(
      map((res: any) => {
        if (res != null) {
          this.modLoading.emit('none');
        }
        return res;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.modLoading.emit('none');
        return this.onError;
      })
    );
  }

  onSelect(role: Role) {
    if (this.lastRole != role){
      this.roleSelected.emit(role);
      this.lastRole = role;
    } else {
      let defRole: Role;
      (async () => {
        this.roleSelected.emit(defRole);
        await delay(40);
        this.roleSelected.emit(role);
      })();
    }
    window.scroll(0,0);
  }

}
