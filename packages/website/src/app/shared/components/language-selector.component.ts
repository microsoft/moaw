import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';

export interface LanguageOption {
  code: string;
  label: string;
  url: string;
}

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="language-selector" *ngIf="languages.length > 0">
      <button class="language-button" (click)="toggleDropdown($event)">
        <app-icon name="globe" size="20"></app-icon>
        <span class="current-language">{{ currentLanguage }}</span>
        <app-icon name="chevron-down" size="16" class="chevron"></app-icon>
      </button>
      <div class="language-dropdown" *ngIf="isOpen">
        <a
          *ngFor="let lang of languages"
          [href]="lang.url"
          class="language-option"
          [class.active]="lang.code === currentLanguage"
        >
          {{ lang.label }}
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .language-selector {
        position: relative;
        display: inline-block;
      }

      .language-button {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        color: var(--text-light);
        padding: var(--space-xs) var(--space-sm);
        cursor: pointer;
        transition: all var(--transition-duration);
        white-space: nowrap;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
        }
      }

      .current-language {
        font-size: var(--text-size-sm);
        text-transform: uppercase;
      }

      .chevron {
        opacity: 0.7;
      }

      .language-dropdown {
        position: absolute;
        top: calc(100% + var(--space-xs));
        right: 0;
        background: var(--background);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        min-width: 200px;
        z-index: 1000;
        overflow: hidden;
      }

      .language-option {
        display: block;
        padding: var(--space-sm) var(--space-md);
        color: var(--text);
        text-decoration: none;
        transition: background var(--transition-duration);

        &:hover {
          background: var(--hover-color);
        }

        &.active {
          background: var(--primary);
          color: var(--text-light);
          font-weight: 500;
        }
      }
    `
  ]
})
export class LanguageSelectorComponent {
  @Input() languages: LanguageOption[] = [];
  @Input() currentLanguage: string = 'en';
  isOpen: boolean = false;

  toggleDropdown(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      // Close dropdown when clicking outside
      setTimeout(() => {
        document.addEventListener('click', this.closeDropdown.bind(this), { once: true });
      });
    }
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
