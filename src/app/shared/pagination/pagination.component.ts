import { Component, Input, EventEmitter, Output } from '@angular/core';

export interface Pagination {
  itemsCount: number;
  pageSize: number;
}

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})

export class PaginationComponent {
  public pagesArray: Array<number> = [];
  public currentPage: number = 1;
  @Output() goToPage = new EventEmitter<number>();
  
  @Input() set setPagination(pagination: Pagination) {
    if (pagination) {
      const pagesAmount = Math.ceil( pagination.itemsCount / pagination.pageSize );
      this.pagesArray = new Array(pagesAmount).fill(1);
    }
  }

  public setPage(pageNumber: number): void {
    // Prevent changes if the same page was selected
    if (pageNumber === this.currentPage)
      return;
    this.currentPage = pageNumber;
    this.goToPage.emit(pageNumber);
  }

}
