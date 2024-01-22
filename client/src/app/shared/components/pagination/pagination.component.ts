import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
  standalone: true,
  imports: [CommonModule, NgIconsModule]
})
export class PaginationComponent implements OnChanges {
  @Input() page!: number;
  @Input() total!: number;
  @Input() row!: number;
  @Output('pageNum') pageNum = new EventEmitter<{ page: number, row: number }>()
  maxPage!: number;
  selectedPage!: number;

  ngOnChanges(changes: SimpleChanges): void {
    this.totalLinksArray()
    this.selectedPage = this.page
  }

  totalLinksArray() {
    let result = Math.ceil(this.total / this.row);
    this.maxPage = Math.max(result, 1);
    return Array.from({ length: this.maxPage }, (_, i) => i + 1);
  }

  onLinkClick(page: number) {
    this.selectedPage = page
    this.pageNum.emit({ page: page, row: this.row })
  }

  onPreviousClick() {
    if (this.selectedPage != 1) {
      --this.selectedPage
      this.onLinkClick(this.selectedPage)
    }
  }

  onNextClick() {
    if (this.selectedPage < this.maxPage) {
      ++this.selectedPage
      this.onLinkClick(this.selectedPage)
    }
  }

  onChangeSelect(event: Event) {
    let selected = (event.target as HTMLSelectElement).value
    this.row = Number(selected)
    this.onLinkClick(this.selectedPage)
  }
}
