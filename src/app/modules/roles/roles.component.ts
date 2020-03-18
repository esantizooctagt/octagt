import { Component, OnInit } from '@angular/core';
import { Role } from '@app/_models';
import { AuthService } from '@app/core/services';
import { RolesService } from '@app/services';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  public clickedRole: Role;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    let isAdmin = this.authService.isAdmin();
    let roleId = this.authService.roleId();
    if (roleId != '' && isAdmin != 1){
      this.router.navigate(['/']);
    }
  }

  roleClicked(role: Role) {
    this.clickedRole = role;
  }

}
