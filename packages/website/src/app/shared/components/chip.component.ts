import { Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-chip',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <app-icon *ngIf="type.includes('removable')" name="x" size="12"></app-icon>
    <ng-content></ng-content>
  `,
  styles: [
    `
      :host {
        display: inline-block;
        margin: var(--space-xxs) var(--space-xxs) 0 0;
        padding: 0 var(--space-xs);
        background: var(--primary-light);
        border-radius: var(--border-radius);
        font-size: var(--text-size-sm);
        color: var(--text-medium);
      }

      app-icon {
        opacity: 0.5;
      }

      :host[type^='clickable'] {
        cursor: pointer;
        transition: filter var(--transition-duration);

        &:hover {
          filter: brightness(90%);
        }
      }
    `
  ]
})
export class ChipComponent {
  @Input() type = '';
}
