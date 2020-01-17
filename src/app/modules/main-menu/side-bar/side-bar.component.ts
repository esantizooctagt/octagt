import { Component, OnInit, Input } from '@angular/core';
import { User } from '@app/_models';


@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  @Input() currentUser: User;
  
  constructor() { }

  ngOnInit() {
  }

}
