import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { githubRepositoryUrl } from '../constants';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [IconComponent],
  template: `
    <footer>
      <app-icon name="mark-github" size="12"></app-icon>
      <a href="${githubRepositoryUrl}" target="_blank">moaw</a> (build: ${environment.version})
    </footer>
  `,
  styles: [
    `
      footer {
        font-size: 0.8em;
        text-align: center;
        margin: var(--space-lg) var(--space-md);

        &,
        a {
          color: var(--neutral-dark);
        }
      }

      app-icon {
        margin-right: var(--space-xxs);
      }
    `
  ]
})
export class FooterComponent {}
