import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';
import { SidebarComponent } from './sidebar.component';
import { Link } from '../link';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <header class="navbar">
      <button *ngIf="sidebar" class="menu-toggle hide-gt-lg" (click)="toggleSidebar($event)">
        <app-icon name="three-bars" size="24"></app-icon>
      </button>
      <div class="logo" *ngIf="logo"><img [src]="logo" alt="logo"/></div>
      <div class="title text-ellipsis">{{ title }}</div>
      <div class="spacer"></div>
      <div class="links text-ellipsis show-gt-md">
        <a *ngFor="let link of links" [href]="link.url" [target]="isExternalLink(link) ? '_blank' : '_self'">
          <app-icon *ngIf="link.icon" [name]="link.icon" size="20" class="link-icon"></app-icon>{{ link.text
          }}<app-icon *ngIf="isExternalLink(link)" name="link-external" size="14" class="external-link"></app-icon>
        </a>
      </div>
    </header>
  `,
  styles: [
    `
      @import '../../../variables';

      .navbar {
        position: sticky;
        z-index: 10;
        top: 0;
        background: var(--primary);
        height: var(--navbar-height);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        padding: var(--space-xs) var(--space-md);

        .title {
          color: var(--text-light);
          font-size: 1.5rem;
          font-weight: 500;
          line-height: 1.5;
        }

        button {
          border: 0;
          color: var(--text-light);
          transition: opacity var(--transition-duration);

          &:hover {
            opacity: 0.7;
          }
        }
      }

      .spacer {
        flex: 1;
      }

      .logo img {
        height: 32px;
        vertical-align: middle;
        margin-right: var(--space-md);
      }

      .links {
        margin-left: var(--space-md);
        color: var(--text-light);

        a {
          color: var(--text-light);

          &:hover {
            text-decoration: none;
            opacity: 0.7;
          }
        }
      }

      .link-icon {
        margin-right: var(--space-xs);
        line-height: 1em;
      }

      .external-link {
        color: var(--text-light);
        opacity: 0.5;
      }

      .menu-toggle {
        margin-left: calc(-1 * var(--space-md));
      }
    `
  ]
})
export class HeaderComponent {
  @Input() logo: string | undefined;
  @Input() title: string | undefined;
  @Input() links: Link[] = [];
  @Input() sidebar: SidebarComponent | undefined;

  toggleSidebar(event: Event) {
    if (this.sidebar) {
      event.preventDefault();
      event.stopPropagation();
      this.sidebar.toggleOpen();
    }
  }

  isExternalLink(link: Link) {
    return link.url.startsWith('http');
  }
}
