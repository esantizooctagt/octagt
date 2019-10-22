import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import * as $ from 'jquery';

import { User } from '@app/_models';
import { AuthService } from '@core/services';
import { UserService } from '@modules/authentication/services';

declare var $:any;

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {
  public currentUser: User;
  public currentTkn;

  currentUserSubscription: Subscription;
  users: User[] = [];

  constructor(
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

  ngOnInit() {
    //this.loadAllUsers();
    $(document).ready(() => {
      // Hide submenus
      $('#body-row .collapse').collapse('hide'); 

      // Collapse/Expand icon
      $('#collapse-icon').addClass('fa-angle-double-left'); 

      // Collapse click
      $('[data-toggle=sidebar-colapse]').click(function() {
          SidebarCollapse();
      });

      function SidebarCollapse () {
          $('.menu-collapsed').toggleClass('d-none');
          $('.sidebar-submenu').toggleClass('d-none');
          $('.submenu-icon').toggleClass('d-none');
          $('#sidebar-container').toggleClass('sidebar-expanded sidebar-collapsed');
          
          // Treating d-flex/d-none on separators with title
          var SeparatorTitle = $('.sidebar-separator-title');
          if ( SeparatorTitle.hasClass('d-flex') ) {
              SeparatorTitle.removeClass('d-flex');
          } else {
              SeparatorTitle.addClass('d-flex');
          }
          
          // Collapse/Expand icon
          $('#collapse-icon').toggleClass('fa-angle-double-left fa-angle-double-right');
      }
    });
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }

  deleteUser(id: number) {
    this.userService.delete(id).pipe(first()).subscribe(() => {
      this.loadAllUsers()
    });
  }

  private loadAllUsers() {
    this.userService.getAll().pipe(first()).subscribe((users:any) => {
      this.users.push(users);
    });
  }
}
