import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { environment } from '../../../environments/environment';
import { githubRepositoryUrl } from '../constants';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <footer [class]="type">
      <ng-container *ngIf="type === 'big'; else defaultFooter">
        <div class="container no-sidebar">
          <h3>Find more learning resources</h3>
          <ul>
            <li><a href="https://docs.microsoft.com/training/" target="_blank">Microsoft Learn</a></li>
            <li><a href="https://twitter.com/msdev" target="_blank">Twitter</a></li>
            <li><a href="https://www.facebook.com/Developpeurs.net/" target="_blank">Facebook</a></li>
            <li><a href="https://www.youtube.com/c/MicrosoftDeveloper/" target="_blank">YouTube</a></li>
          </ul>
        </div>
      </ng-container>
      <ng-template #defaultFooter>
        <app-icon name="mark-github" size="12"></app-icon>
        <a href="${githubRepositoryUrl}" target="_blank">moaw</a> (build: ${environment.version})
      </ng-template>
    </footer>
  `,
  styles: [
    `
      .small {
        font-size: 0.8em;
        text-align: center;
        margin: var(--space-lg) var(--space-md);

        &,
        a {
          color: var(--neutral-dark);
        }
      }

      .big {
        background: var(--neutral-dark);
        padding: var(--space-md) var(--space-xs);

        &,
        a {
          color: var(--text-light);
        }
      }

      app-icon {
        margin-right: var(--space-xxs);
      }
    `
  ]
})
export class FooterComponent {
  @Input() type: 'small' | 'big' = 'small';
}
