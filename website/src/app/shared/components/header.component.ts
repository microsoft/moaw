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
      <button *ngIf="sidebar" class="menu-toggle" (click)="toggleSidebar($event)">
        <app-icon name="three-bars" size="24"></app-icon>
      </button>
      <div class="title text-ellipsis">{{ title }}</div>
      <div class="links">
        <a *ngFor="let link of links" [href]="link.url">{{ link.text }}</a>
      </div>
    </header>
  `,
  styles: [`
    @import '../../../variables';

    .navbar {
      position: sticky;
      z-index: 10;
      top: 0;
      background: var(--primary);
      padding: var(--space-xs);
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

    .menu-toggle {
      margin-left: calc(-1 * var(--space-md));
    }

    @media (min-width: $breakpoint-lg) {
      .menu-toggle {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
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
}
