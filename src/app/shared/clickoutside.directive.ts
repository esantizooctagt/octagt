import {Directive, ElementRef, Output, EventEmitter, HostListener} from '@angular/core';
 
@Directive({
    selector: '[clickOutside]'
})
export class ClickOutsideDirective {
    constructor(private _elementRef : ElementRef) {
    }
 
    @Output()
    public clickOutside = new EventEmitter();
 
    @HostListener('document:click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.id === "searchList" || targetElement.id === "findRecord") {return;}
        const clickedInside = this._elementRef.nativeElement.contains(targetElement);
        if (!clickedInside) {
            this.clickOutside.emit(null);
        }
    }
}