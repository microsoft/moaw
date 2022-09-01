import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { addRouteChangeListener, getHash, getQueryParams, Route, setHash } from '../router';
import { HeaderComponent } from '../shared/components/header.component';
import { SidebarComponent } from '../shared/components/sidebar.component';
import { Workshop, loadWorkshop, createMenuLinks } from './workshop';
import { PaginationComponent } from './pagination.component';
import { MenuLink } from '../shared/link';
import { debounce } from '../shared/event';
import { scrollToId, scrollToTop } from '../shared/scroll';

@Component({
  selector: 'app-workshop',
  standalone: true,
  imports: [CommonModule, MarkdownModule, HeaderComponent, SidebarComponent, PaginationComponent],
  template: `
    <div (click)="sidebar.toggleOpen(false)" class="full-viewport">
      <app-header [title]="workshop?.shortTitle || 'Workshop'" [sidebar]="sidebar"></app-header>
      <div class="content">
        <app-sidebar #sidebar="sidebar" [links]="menuLinks"></app-sidebar>
        <div id="workshop" *ngIf="workshop; else noWorkshop" class="workshop" (scroll)="scrolled($event)">
          <div class="container">
            <markdown (ready)="markdownReady()" ngPreserveWhitespaces [data]="workshop.sections[workshop.step].markdown"></markdown>
            <app-pagination [workshop]="workshop"></app-pagination>
          </div>
        </div>
      </div>
      <ng-template #noWorkshop>
        <p *ngIf="!loading">Could not load workshop :(</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .full-viewport {
      display: flex;
      flex-direction: column;
    }
    
    .content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    
    .workshop {
      height: 100%;
      overflow-y: auto;
      /* scroll-behavior: smooth; */
    }
    
    .container {
      margin: var(--space-lg);
    }
  `]
})
export class WorkshopComponent {
  loading: boolean = true;
  workshop: Workshop | undefined;
  menuLinks: MenuLink[] = [];
  scrollInit: boolean = false;

  scrolled = debounce((_event: Event) => {
    if (!this.scrollInit) {
      this.scrollInit = true;
      return;
    }
    this.updateAnchor();
  });

  updateAnchor() {
    const anchor = this.findCurrentAnchor() || '#';
    if (anchor !== getHash()) {
      setHash(anchor);
      this.updateActiveLink();
    }
  }

  findCurrentAnchor(): string | undefined {
    for (const link of this.menuLinks) {
      if (link.active && link.children) {
        for (let i = link.children.length - 1; i >= 0; i--) {
          const sublink = link.children[i];
          if (this.isAnchorActive(sublink.url)) {
            return sublink?.url;
          }
        }
      }
    }
    return undefined;
  }

  isAnchorActive(anchor: string): boolean {
    const thresholdPixels = 100;
    const workshopContainer = document.getElementById('workshop');
    const workshopTop = workshopContainer?.getBoundingClientRect().top ?? 0;
    const element = document.getElementById(anchor.substring(1));
    const rect = element?.getBoundingClientRect();
    return Boolean(rect?.top && rect.top < workshopTop + thresholdPixels);
  }

  updateActiveLink() {
    if (this.workshop) {
      this.menuLinks.forEach((link, index) => {
        link.active = index === this.workshop!.step
        if (link.active) {
          link.children?.forEach(sublink => {
            sublink.active = sublink.url === getHash();
          });
        }
      });
    }
  }

  async ngAfterViewInit() {
    const currentPath = decodeURIComponent(window.location.pathname);
    const { src, step, wtid, ocid } = getQueryParams();
    const repoPath = src ?? currentPath.substring('/workshop/'.length);

    this.loading = true;
    try {
      this.workshop = await loadWorkshop(repoPath, { wtid, ocid });
      this.menuLinks = createMenuLinks(this.workshop);
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
    
    if (this.workshop && step) {
      this.workshop.step = Number(step);
    }
    addRouteChangeListener(this.routeChanged.bind(this));
  }
  
  updateTitle() {
    if (this.workshop) {
      document.title = `${this.workshop.shortTitle} - ${this.workshop.sections[this.workshop.step].title}`;
    }
  }

  routeChanged(_route: Route) {
    const { step } = getQueryParams();
    const stepNumber = Number(step);
    if (this.workshop && step) {
      if (this.workshop.step !== stepNumber) {
        this.workshop.step = stepNumber;
        this.updateAnchor();
        scrollToTop('workshop');
      } else {
        // TODO: won't work until md ready
        
      }
      this.updateTitle();
      this.updateActiveLink();
    }
  }

  markdownReady() {
    scrollToId(getHash().substring(1));
  }
}
