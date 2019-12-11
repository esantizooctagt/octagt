import { Component, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
// import { delay } from 'q';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnDestroy {
  @Input() readonly placeholder: string = '';
  @Output() setValue: EventEmitter<string> = new EventEmitter();
  @Output() setNumber: EventEmitter<number> = new EventEmitter();

  private _searchSubject: Subject<string> = new Subject();
  private _numberSubject: Subject<number> = new Subject();
  public loading:boolean = false;
  
  constructor() {
    this._setSearchSubscription();
    this._setValueSubscription();
   }

  private _setSearchSubscription() {
    this._searchSubject.pipe(
      debounceTime(500)
    ).subscribe((searchValue: string) => {
      this.setValue.emit( searchValue );
    });
  }

  private _setValueSubscription() {
    this._numberSubject.pipe(
      debounceTime(500)
    ).subscribe((numValue: number) => {
      this.setNumber.emit( numValue );
    });
  }

  public updateSearch(searchTextValue: string) {
    this.loading = true;
    this._searchSubject.next( searchTextValue );
    this.loading = false;
  }

  public updateSearchUp(event, searchTextValue: string) {
    if (event.key == "Enter") { 
      this.loading = true;
      this._searchSubject.next( searchTextValue );
      this.loading = false;
    }
  }

  public onChangeNumber(num: number) {
    this._numberSubject.next ( num );
  }

  ngOnDestroy() {
    this._searchSubject.unsubscribe();
  }
}
