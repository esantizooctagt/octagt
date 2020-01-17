import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@app/_models';
import { AuthService } from '@core/services';
import { UserService } from '@modules/authentication/services';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.scss']
})
export class MenuBarComponent implements OnInit {
  @Input() currentUser: User;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  get isAdmin() {
    return this.currentUser && this.currentUser.isAdmin === 1;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
