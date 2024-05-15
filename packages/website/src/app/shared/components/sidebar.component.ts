import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuLink } from '../link';
import { navigate, getCurrentUrlWithoutHash } from '../../router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="sidebar" [class.open]="open" rel="menu" aria-label="Navigation menu">
      <ul class="links">
        <li *ngFor="let link of links; let index = index">
          <a [href]="makeUrl(link.url)" (click)="openLink($event, link.url)" [class.active]="link.active"
            >{{ getNumber(index) }} {{ link.text }}</a
          >
          <ul *ngIf="link.active && link.children" class="sub-links">
            <li *ngFor="let sublink of link.children" [ngClass]="'level-' + sublink.level">
              <a
                [href]="makeUrl(sublink.url)"
                (click)="openLink($event, sublink.url)"
                [class.active]="sublink.active"
                >{{ sublink.text }}</a
              >
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  `,
  styles: [
    `
      @import '../../../theme/variables';

      .sidebar {
        position: fixed;
        z-index: 10;
        top: var(--navbar-height);
        left: calc(-1 * var(--sidebar-width));
        bottom: 0;
        width: var(--sidebar-width);
        background-color: var(--neutral-light);
        border-right: 1px solid var(--border-color);
        overflow-y: auto;
        transition: left var(--transition-duration);

        &.open,
        &:has(*:focus) {
          left: 0;
        }
      }

      @media (min-width: $breakpoint-lg) {
        .sidebar {
          position: initial;
          height: 100%;
        }
      }

      .links {
        padding: 0;

        li {
          list-style: none;
          margin: var(--space-xs);
        }

        a {
          display: block;
          color: var(--text-color);
          font-weight: bold;
          border-radius: var(--border-radius);
          padding: var(--space-xxs) var(--space-xs);

          &:hover {
            color: var(--primary-dark);
            text-decoration: none;
          }

          &.active {
            color: var(--primary-dark);
            background: rgba(0, 0, 0, 0.05);
          }
        }
      }

      .sub-links {
        padding: 0 0 0 var(--space-xs);
        margin: 0;

        li {
          margin: 0;
        }
        a {
          font-size: var(--text-size-md);
          font-weight: normal;

          &.active {
            background: none;
            font-weight: bold;
          }
        }
        .level-2 {
          margin-left: var(--space-md);
        }
        .level-3 {
          margin-left: calc(var(--space-md) * 2);
        }
        .level-4 {
          margin-left: calc(var(--space-md) * 3);
        }
        .level-5 {
          margin-left: calc(var(--space-md) * 4);
        }
      }
    `
  ],
  exportAs: 'sidebar'
})
export class SidebarComponent {
  open: boolean = false;

  @Input() links: MenuLink[] = [];
  @Input() numbering: boolean | undefined = true;

  toggleOpen(open?: boolean) {
    this.open = open ?? !this.open;
  }

  makeUrl(url: string) {
    return url.startsWith('#') ? getCurrentUrlWithoutHash() + url : url;
  }

  openLink(event: Event, url: string) {
    if (!url.startsWith('#')) {
      event.preventDefault();
      event.stopPropagation();
      navigate(url);
    }
    this.toggleOpen(false);
  }

  getNumber(index: number) {
    return this.numbering === false ? '' : `${index + 1}.`;
  }
}
