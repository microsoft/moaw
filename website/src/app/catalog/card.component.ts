import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentEntry } from './content-entry';
import { DatePipe } from '../shared/pipes/date.pipe';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <a [href]="workshop.url" [title]="workshop.description" class="card">
      <div class="banner" [style]="{ 'background-image': 'url(' + workshop.bannerUrl + ')' }">
        <div *ngIf="workshop.duration" class="duration">{{ workshop.duration }} min</div>
        <!-- <div class="last-updated">Updated: {{ workshop.lastUpdated | date }}</div> -->
      </div>
      <div class="title">{{ workshop.title }}</div>
      <div class="tags">{{ workshop.tags.slice(0, 4).join(', ') }}</div>
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
        box-shadow: 0 0px 1px 0 rgba(0 0 0 / 20%), 0 2px 1px -1px rgba(0 0 0 / 10%), 0 2px 2px 0 rgba(0 0 0 / 10%);
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
        background-color: var(--neutral-light);
        background-size: cover;
        background-repeat: no-repeat;
        background-position: 50%;

        img {
          margin: 0;
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
        font-size: var(--text-size-sm);
        margin: var(--space-md);
        text-transform: lowercase;
        opacity: 0.7;
      }
    `
  ]
})
export class CardComponent {
  @Input() workshop!: ContentEntry;
}
