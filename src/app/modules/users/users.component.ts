import { Component, OnInit } from '@angular/core';
import { User } from '@app/_models';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public clickedUser: User;
  
  constructor() { }

  ngOnInit() {
  }

  onSelected(user: User) {
    this.clickedUser = user;
  }

}
