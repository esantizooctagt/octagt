import { Component, OnInit } from '@angular/core';
import { User } from '@app/_models';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  public clickedUser: User;
  loading: boolean =false;
  
  constructor() { }

  ngOnInit() {
  }

  onSelected(user: User) {
    this.clickedUser = user;
  }

  displayLoading(event){
    if (event === 'display') {
      setTimeout(() => {
        delay(50);
        this.loading = true;
      });
    } else {
      this.loading = false;
    }
  }

}
