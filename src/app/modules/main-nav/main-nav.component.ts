import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { User } from '@app/_models';
import { AuthService } from '@core/services';
import { environment } from '@environments/environment';

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
  isAdmin: boolean=false;
  readonly imgPath = environment.bucket;

  users: User[] = [];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router
    ) {
    // this.currentUserSubscription = this.authService.currentUser.subscribe(user => {
    // //this.currentUser = user;
    // });
  }

  ngOnInit(){
    this.companyId = this.authService.companyId();
    this.userId = this.authService.userId();
    this.isAdmin = this.authService.isAdmin();
    if (this.authService.avatar() != '') {
      this.avatar = this.imgPath + this.authService.avatar();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
