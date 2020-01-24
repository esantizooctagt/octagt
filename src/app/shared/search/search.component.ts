import { Component, Output, EventEmitter, OnDestroy, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnDestroy, OnInit {
  @Input() readonly placeholder: string = '';
  @Input() salesView: boolean = false;
  @Output() setValue: EventEmitter<string> = new EventEmitter();
  @Output() view: EventEmitter<string> = new EventEmitter();
  @Output() searchStep: EventEmitter<string> = new EventEmitter();

  private _searchSubject: Subject<string> = new Subject();
  public loading:boolean = false;
  
  constructor() {
    this._setSearchSubscription();
   }

  private _setSearchSubscription() {
    this._searchSubject.pipe(
      debounceTime(500)
    ).subscribe((searchValue: string) => {
      this.setValue.emit( searchValue );
    });
  }

  changeView(value: string){
    this.view.emit( value );
  }

  changeStep(){
    this.searchStep.emit ( '2' );
  }

  public updateSearchUp(event, searchTextValue: string) {
    this.loading = true;
    debounceTime(500);
    this._searchSubject.next( searchTextValue );
    this.loading = false;
  }

  ngOnDestroy() {
    this._searchSubject.unsubscribe();
  }

  ngOnInit(){
    this.view.emit( 'list' );
  }
}
