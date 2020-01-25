import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { User } from '@app/_models';
import { AuthService } from '@core/services';
import { UserService } from '@modules/authentication/services';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent {
  public currentUser: User;
  public currentTkn;

  currentUserSubscription: Subscription;
  users: User[] = [];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
    ) {
    this.authService.currentUser.subscribe(x => this.currentUser = x);
    this.currentUser = sessionStorage.getItem('OCT_USS')? JSON.parse(sessionStorage.getItem('OCT_USS')) : '';
    this.currentTkn = sessionStorage.getItem('OCT_TKN')? JSON.parse(sessionStorage.getItem('OCT_TKN')) : '';
    
    this.currentUserSubscription = this.authService.currentUser.subscribe(user => {
    //this.currentUser = user;
    });
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
