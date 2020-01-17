import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Generic } from '@app/_models';

@Component({
  selector: 'app-findrecord',
  templateUrl: './findrecord.component.html',
  styleUrls: ['./findrecord.component.scss']
})
export class FindrecordComponent implements OnInit, OnDestroy, OnChanges {
  showDropDown = false;
  findValue: string = '';

  @Input() readonly placeholder: string = '';
  @Input() data: Generic[]=[];
  @Input() reset: string;
  @Output() entryValue: EventEmitter<string> = new EventEmitter();
  @Output() customerCode: EventEmitter<string> = new EventEmitter();

  private _searchSubject: Subject<string> = new Subject();
  constructor() { 
    this._setSearchSubscription();
  }

  public loading:boolean = false;
  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    if (changes.data != undefined) {
      let valueList = changes.data.currentValue;
      if (valueList.length > 0){
        this.showDropDown = true;
      } else {
        this.showDropDown = false;
      }
    }
    if (changes.reset != undefined) {
      let resetInput = changes.reset.currentValue;
      if (resetInput == '') {
        this.findValue = '';
      }
    }
  }

  toggleDropDown(){
    this.showDropDown =!this.showDropDown;
  }

  private _setSearchSubscription() {
    this._searchSubject.pipe(
      debounceTime(500)
    ).subscribe((res: string) => {
      this.entryValue.emit( res );
    });
  }

  public updateSearch(searchTextValue: string) {
    this.loading = true;
    this._searchSubject.next( searchTextValue );
    this.loading = false;
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

  selectValue(code, name){
    this.showDropDown = false;
    this.customerCode.emit( code );
    this.findValue = name;
  }

  verifyDropDown(){
    let entro:boolean=false;
    if (this.showDropDown === false){return;}
    if(this.data.length > 0){
      this.data.filter(resp => {
        if (resp['n'].toLowerCase() === this.findValue.toLowerCase()) {
          this.customerCode.emit( resp['c'] );
          this.findValue = resp['n'];
          entro =true;
          return;
        }
      });
    }
    if (entro == false){
      this.customerCode.emit( '' );
      this.findValue = '';
    }
  }
}
