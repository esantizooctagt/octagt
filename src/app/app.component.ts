import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '@core/services';
import { User } from '@app/_models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentUser: User;
  title = 'octagt';

  constructor(
    private router: Router,
    private authenticationService: AuthService
  ) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  get isAdmin() {
    return this.currentUser && this.currentUser.isAdmin === 1;
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
