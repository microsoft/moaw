import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { getQueryParams } from '../../router';
import { environment } from '../../../environments/environment';
import { githubRepositoryUrl, mainScrollableId } from '../constants';
import { scrollToTop } from '../scroll';
import { IconComponent } from './icon.component';
import { updateTrackingCodes } from '../loader';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <footer [class]="type">
      <ng-container *ngIf="type === 'big'; else defaultFooter">
        <h2 class="visually-hidden">Footer</h2>
        <div class="container no-sidebar split-layout">
          <div class="image">
            <img src="images/bit/cat-learning.jpg" alt="students" />
          </div>
          <nav aria-labelledby="learn">
            <h3 id="learn">Learn more</h3>
            <ul class="list">
              <li>
                <a [href]="trackUrl('https://learn.microsoft.com/training/')" target="_blank">Training</a>
              </li>
              <li>
                <a [href]="trackUrl('https://learn.microsoft.com/certifications/')" target="_blank">Certifications</a>
              </li>
              <li><a [href]="trackUrl('https://learn.microsoft.com/samples/')" target="_blank">Code Samples</a></li>
            </ul>
          </nav>
          <nav aria-labelledby="follow">
            <h3 id="follow">Follow</h3>
            <ul class="list">
              <li><a href="https://www.youtube.com/c/MicrosoftDeveloper/" target="_blank">YouTube</a></li>
              <li><a href="https://twitter.com/msdev" target="_blank">Twitter</a></li>
              <li><a href="https://www.linkedin.com/company/microsoft/" target="_blank">LinkedIn</a></li>
              <li><a href="https://www.facebook.com/Developpeurs.net/" target="_blank">Facebook</a></li>
            </ul>
          </nav>
          <nav aria-labelledby="community">
            <h3 id="community">Community</h3>
            <ul class="list">
              <li><a href="${githubRepositoryUrl}" target="_blank">GitHub</a></li>
              <li><a href="${githubRepositoryUrl}/blob/main/CONTRIBUTING.md" target="_blank">Contribute</a></li>
              <li><a href="${githubRepositoryUrl}/blob/main/CODE_OF_CONDUCT.md" target="_blank">Code Of Conduct</a></li>
              <li>&nbsp;</li>
            </ul>
          </nav>
        </div>
        <div class="container no-sidebar">
          <div class="version">
            <span>moaw build: ${environment.version}</span>
            <span *ngIf="credits"> - {{ credits }}</span>
          </div>
          <button class="button-round back-to-top" (click)="backToTop()" title="Back to top">
            <app-icon name="chevron-up" size="24"></app-icon>
          </button>
        </div>
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
        font-size: var(--text-size-sm);
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
          font-size: var(--text-size-lg);
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
        font-size: 24px;
      }

      .version {
        text-align: center;
        font-size: var(--text-size-sm);
        opacity: 0.8;
      }

      @media (max-width: $breakpoint-md-max) {
        .image {
          text-align: center;
        }
      }
    `
  ]
})
export class FooterComponent {
  private wtid?: string;
  private ocid?: string;

  @Input() type: 'small' | 'big' = 'small';
  @Input() credits?: string;

  trackUrl(url: string) {
    return updateTrackingCodes(url, { wtid: this.wtid, ocid: this.ocid });
  }

  ngOnInit() {
    const { wtid, ocid } = getQueryParams();
    this.wtid = wtid;
    this.ocid = ocid;
  }

  backToTop() {
    scrollToTop(mainScrollableId, true);
    scrollToTop(undefined, true);
  }
}
