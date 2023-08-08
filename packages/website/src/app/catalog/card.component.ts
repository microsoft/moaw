import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentEntry } from './content-entry';
import { DatePipe } from '../shared/pipes/date.pipe';
import { ChipComponent } from '../shared/components/chip.component';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, DatePipe, ChipComponent],
  template: `
    <a [href]="workshop.url" [title]="workshop.description" class="card">
      <div class="banner">
        <div *ngIf="workshop.duration" class="duration" [ngClass]="getDurationClass(workshop.duration)">
          {{ getDurationText(workshop.duration) }}
        </div>
        <!-- <div class="last-updated">Updated: {{ workshop.lastUpdated | date }}</div> -->
      </div>
      <div class="title">{{ workshop.title }}</div>
      <div class="tags">
        <app-chip *ngFor="let tag of workshop.tags.slice(0, 4)" (click)="selectTag(tag, $event)" type="clickable">
          {{ tag }}
        </app-chip>
      </div>
    </a>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .card {
        display: flex;
        flex-direction: column;
        background: var(--background);
        border-radius: var(--border-radius);
        box-shadow:
          0 0px 1px 0 rgba(0 0 0 / 20%),
          0 2px 1px -1px rgba(0 0 0 / 10%),
          0 2px 2px 0 rgba(0 0 0 / 10%);
        overflow: hidden;
        transition-property: box-shadow, transform;
        transition-duration: var(--transition-duration);
        color: var(--text);

        &:hover {
          text-decoration: none;
          transform: translate3d(0, -2px, 0);
          box-shadow: 0 5px 10px 0 rgb(0 0 0 / 20%);
        }
      }

      .banner {
        position: relative;
        height: 120px;
        height: 20px;

        img {
          margin: 0;
          height: 0px;
        }
      }

      .last-updated,
      .duration {
        position: absolute;
        bottom: 0;
        transform: translateY(50%);
        font-size: var(--text-size-xs);
        color: var(--text-light);
        background: var(--neutral-dark);
        border-radius: var(--border-radius);
        padding: 0 var(--space-xs);

        &.short {
          background: var(--accent-3);
        }
        &.medium {
          background: var(--medium);
        }
        &.long {
          background: var(--primary);
        }
      }

      .last-updated {
        left: var(--space-md);
      }

      .duration {
        right: var(--space-md);
      }

      .title {
        flex: 1;
        font-weight: bold;
        margin: var(--space-md);
      }

      .tags {
        margin: 0 var(--space-md) var(--space-md) var(--space-md);
        text-transform: lowercase;
      }
    `
  ]
})
export class CardComponent {
  @Input() workshop!: ContentEntry;
  @Output() clickTag: EventEmitter<string> = new EventEmitter();

  getDurationClass(duration: number): string {
    if (duration <= 30) {
      return 'short';
    } else if (duration <= 60) {
      return 'medium';
    } else {
      return 'long';
    }
  }

  getDurationText(duration: number): string {
    if (duration > 60) {
      const hours = Math.round((duration / 60) * 10) / 10;
      return hours + ' hour';
    } else {
      return duration + ' min';
    }
  }

  selectTag(tag: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.clickTag.emit(tag);
  }
}
