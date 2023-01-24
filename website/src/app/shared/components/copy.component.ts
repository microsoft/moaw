import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-copy',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <button class="button-copy" (click)="copyCode()" [class.copied]="copied" [attr.aria-label]="copied ? 'copied' : 'copy'">
      <app-icon *ngIf="copied; else copy" name="check" size="16"></app-icon>
      <ng-template #copy>
        <app-icon name="copy" size="16"></app-icon>
      </ng-template>
    </button>
  `,
  styles: [
    `
      .button-copy {
        background-color: rgba(255, 255, 255, 0.15);
        border-color: var(--neutral);
        color: var(--neutral);
        font-size: var(--text-size-sm);
        padding: var(--space-xs);

        &:hover {
          border-color: var(--neutral-light);
          color: var(--text-light);
        }

        &.copied {
          border-color: var(--success);
          color: var(--success);
        }
      }
    `
  ]
})
export class CopyComponent {
  copied: boolean = false;
  timeout: any = undefined;

  copyCode() {
    this.copied = true;
    this.timeout = setTimeout(() => {
      this.copied = false;
    }, 1500);
  }

  ngOnDestroy() {
    clearTimeout(this.timeout);
  }
}
