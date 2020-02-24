import { Component, OnInit } from '@angular/core';
import { Role } from '@app/_models';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {

  public clickedRole: Role;
  loading: boolean =false;

  constructor() { }

  ngOnInit() {
  }

  roleClicked(role: Role) {
    this.clickedRole = role;
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
