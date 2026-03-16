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
      <app-icon name="globe" size="20" class="globe-icon"></app-icon>
      <select 
        class="language-select"
        [value]="currentLanguage"
        (change)="onLanguageChange($event)"
        aria-label="Select language"
      >
        <option 
          *ngFor="let lang of languages"
          [value]="lang.code"
          [attr.data-url]="lang.url"
        >
          {{ lang.label }}
        </option>
      </select>
    </div>
  `,
  styles: [
    `
      .language-selector {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
      }

      .globe-icon {
        color: var(--text-light);
      }

      .language-select {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        color: var(--text-light);
        padding: var(--space-xs) var(--space-sm);
        font-size: var(--text-size-sm);
        cursor: pointer;
        transition: all var(--transition-duration);
        text-transform: uppercase;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
        }

        &:focus {
          outline: 2px solid rgba(255, 255, 255, 0.5);
          outline-offset: 2px;
        }

        option {
          background: var(--background);
          color: var(--text);
          text-transform: none;
        }
      }
    `
  ]
})
export class LanguageSelectorComponent {
  @Input() languages: LanguageOption[] = [];
  @Input() currentLanguage: string = 'en';

  onLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const selectedOption = select.options[select.selectedIndex];
    const url = selectedOption.getAttribute('data-url');
    if (url) {
      window.location.href = url;
    } else {
      console.error('Language selector: Invalid URL for selected language');
    }
  }
}
