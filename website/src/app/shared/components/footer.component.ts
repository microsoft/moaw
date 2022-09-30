import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { environment } from '../../../environments/environment';
import { githubRepositoryUrl, mainScrollableId } from '../constants';
import { scrollToTop } from '../scroll';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <footer [class]="type">
      <ng-container *ngIf="type === 'big'; else defaultFooter">
        <div class="container no-sidebar split-layout">
          <div class="image">
            <img src="images/bit-student.png" alt="students" />
          </div>
          <div>
            <h3>Learn more</h3>
            <ul class="list">
              <li><a href="https://learn.microsoft.com/training/" target="_blank">Microsoft Training</a></li>
              <li><a href="https://learn.microsoft.com/certifications/" target="_blank">Certifications</a></li>
              <li><a href="https://learn.microsoft.com/samples/" target="_blank">Code Samples</a></li>
            </ul>
          </div>
          <div>
            <h3>Follow</h3>
            <ul class="list">
              <li><a href="https://www.youtube.com/c/MicrosoftDeveloper/" target="_blank">YouTube</a></li>
              <li><a href="https://twitter.com/msdev" target="_blank">Twitter</a></li>
              <li><a href="https://www.linkedin.com/company/microsoft/" target="_blank">LinkedIn</a></li>
              <li><a href="https://www.facebook.com/Developpeurs.net/" target="_blank">Facebook</a></li>
            </ul>
          </div>
          <div>
            <h3>Community</h3>
            <ul class="list">
              <li><a href="${githubRepositoryUrl}" target="_blank">GitHub</a></li>
              <li><a href="${githubRepositoryUrl}/blob/main/CONTRIBUTING.md" target="_blank">Contribute</a></li>
              <li><a href="${githubRepositoryUrl}/blob/main/CODE_OF_CONDUCT.md" target="_blank">Code Of Conduct</a></li>
              <li>&nbsp;</li>
              <li class="version">moaw build: ${environment.version}</li>
            </ul>
          </div>
        </div>
        <button class="button-round back-to-top" (click)="backToTop()">
          <app-icon name="chevron-up" size="24"></app-icon>
        </button>
      </ng-container>
      <ng-template #defaultFooter>
        <app-icon class="with-margin" name="mark-github" size="12"></app-icon>
        <a href="${githubRepositoryUrl}" target="_blank">moaw</a> (build: ${environment.version})
      </ng-template>
    </footer>
  `,
  styles: [
    `
      @import '../../../theme/variables';

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
        position: relative;
        background: var(--dark);
        padding: var(--space-md) var(--space-xs);

        &,
        a {
          color: var(--text-light);
        }

        h3 {
          font-size: 1.1rem;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: var(--space-md);
        }
      }

      .with-margin {
        margin-right: var(--space-xxs);
      }

      .image {
        flex: 1.5;
        align-self: center;

        img {
          border-radius: 50%;
          height: 200px;
          width: 200px;
        }
      }

      .list {
        list-style-type: none;
        padding: 0;
        margin: 0;

        > li {
          margin: var(--space-xs) 0;
        }
      }

      .back-to-top {
        position: absolute;
        right: var(--space-lg);
        bottom: var(--space-lg);
      }

      .version {
        font-size: 0.8em;
        opacity: 0.5;
      }
    `
  ]
})
export class FooterComponent {
  @Input() type: 'small' | 'big' = 'small';

  backToTop() {
    scrollToTop(mainScrollableId, true);
  }
}
