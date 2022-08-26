import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Workshop } from './workshop';
import { setQueryParams } from '../router';
import { scrollToTop } from '../shared/scroll';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="pagination" aria-label="Page navigation">
      <button [hidden]="!hasPrevious()" (click)="previous()" class="previous" aria-label="Go to previous page">
        <div class="label">Previous</div>
        <div class="title">{{ getTitle(-1) }}</div>
      </button>
      <button [hidden]="!hasNext()" (click)="next()" class="next" aria-label="Go to next page">
        <div class="label">Next</div>
        <div class="title">{{ getTitle(1) }}</div>
      </button>
    </nav>
  `,
  styles: [
    `
      nav {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: var(--space-md);
        margin: var(--space-xl) 0 var(--space-md) 0;
      }

      .previous {
        text-align: left;

        > .title::before {
          content: '←';
          margin-right: var(--space-xxs);
        }
      }

      .next {
        grid-column: 2;
        text-align: right;

        > .title::after {
          content: '→';
          margin-left: var(--space-xxs);
        }
      }

      .label {
        font-size: 0.8rem;
      }

      .title {
        color: var(--primary);
        font-weight: bold;
        margin-top: var(--space-xxs);

        /* &::before, &::after {
        display: inline-flex;
        padding: var(--space-xxs);
        background: var(--primary);
        color: var(--text-light);
        border-radius: 50%;
        width: 1rem;
        height: 1rem;
        justify-content: center;
        align-items: center;
      } */
      }
    `
  ]
})
export class PaginationComponent {
  @Input() workshop: Workshop | undefined;

  hasPrevious(): boolean {
    return Boolean(this.workshop && this.workshop.step > 0);
  }

  hasNext(): boolean {
    return Boolean(this.workshop && this.workshop.step < this.workshop.sections.length - 1);
  }

  getTitle(sectionOffset: number) {
    if (!this.workshop) {
      return '';
    }
    const section = this.workshop.sections[this.workshop.step + sectionOffset];
    return section?.title ?? '';
  }

  previous() {
    if (this.hasPrevious()) {
      this.workshop!.step--;
      setQueryParams({ step: this.workshop!.step });
      scrollToTop();
    }
  }

  next() {
    if (this.hasNext()) {
      this.workshop!.step++;
      setQueryParams({ step: this.workshop!.step });
      scrollToTop();
    }
  }
}
