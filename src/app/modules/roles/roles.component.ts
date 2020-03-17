import { Component, OnInit } from '@angular/core';
import { Role } from '@app/_models';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  public clickedRole: Role;

  constructor() { }

  ngOnInit() {
  }

  roleClicked(role: Role) {
    this.clickedRole = role;
  }

}
