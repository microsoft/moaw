import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [IconComponent],
  template: `
    <footer>
      <app-icon name="mark-github" size="12"></app-icon>
      <a href="https://github.com/themoaw/moaw" target="_blank">moaw</a> (build: {{ version }})
    </footer>
  `,
  styles: [`
    footer {
      font-size: 0.8em;
      text-align: center;
      margin: var(--space-lg) var(--space-md);

      &, a {
        color: var(--neutral-dark);
      }
    }
    
    app-icon {
      margin-right: var(--space-xxs);
    }
  `]
})
export class FooterComponent {
  version = environment.version;
}
