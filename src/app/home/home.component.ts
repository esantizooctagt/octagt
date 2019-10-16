import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public currentUser;
  constructor() {
    this.currentUser = localStorage.getItem('OCT_USS')? JSON.parse(localStorage.getItem('OCT_USS')) : '';
  }

  ngOnInit() {
  }

}
