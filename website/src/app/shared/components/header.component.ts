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
