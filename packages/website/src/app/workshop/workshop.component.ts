import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { addRouteChangeListener, getHash, getQueryParams, redirectRoutePath, Route, setHash } from '../router';
import { HeaderComponent } from '../shared/components/header.component';
import { FooterComponent } from '../shared/components/footer.component';
import { SidebarComponent } from '../shared/components/sidebar.component';
import { LoaderComponent } from '../shared/components/loader.component';
import { CopyComponent } from '../shared/components/copy.component';
import { Workshop, loadWorkshop, createMenuLinks } from './workshop';
import { PaginationComponent } from './pagination.component';
import { MenuLink } from '../shared/link';
import { debounce } from '../shared/event';
import { scrollToId, scrollToTop } from '../shared/scroll';
import { getRepoPath } from '../shared/loader';

@Component({
  selector: 'app-workshop',
  standalone: true,
  imports: [
    CommonModule,
    MarkdownModule,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    LoaderComponent,
    PaginationComponent,
    CopyComponent
  ],
  template: `
    <div (click)="sidebar.toggleOpen(false)" class="full-viewport">
      <app-header [title]="workshop?.shortTitle || 'Workshop'" [sidebar]="sidebar"></app-header>
      <main class="content">
        <app-sidebar
          #sidebar="sidebar"
          [links]="menuLinks"
          [numbering]="workshop?.meta?.navigation_numbering"
        ></app-sidebar>
        <app-loader
          id="workshop"
          [loading]="loading"
          class="scrollable"
          [class.container]="loading"
          (scroll)="enableScrollEvent && scrolled($event)"
        >
          <div *ngIf="workshop; else noWorkshop" class="container">
            <markdown
              (ready)="markdownReady()"
              ngPreserveWhitespaces
              [data]="workshop.sections[workshop.step].markdown"
              clipboard
              [clipboardButtonComponent]="copyComponent"
              [style.--authors]="workshop.step === 0 ? authors : ''"
            >
              ></markdown
            >
            <app-pagination [workshop]="workshop"></app-pagination>
          </div>
          <app-footer></app-footer>
        </app-loader>
      </main>
      <ng-template #noWorkshop>
        <p class="container" *ngIf="!loading">Could not load workshop :(</p>
      </ng-template>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep markdown {
        h1::after {
          display: block;
          content: var(--authors);
          font-style: italic;
          font-size: var(--text-size-md);
          font-weight: normal;
          margin-top: var(--space-xs);
          opacity: 0.7;
        }
      }
    `
  ]
})
export class WorkshopComponent {
  readonly copyComponent = CopyComponent;
  loading: boolean = true;
  workshop: Workshop | undefined;
  authors: string = '';
  menuLinks: MenuLink[] = [];
  scrollInit: boolean = false;
  enableScrollEvent: boolean = false;

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
        link.active = index === this.workshop!.step;
        if (link.active) {
          link.children?.forEach((sublink) => {
            const anchor = decodeURIComponent(getHash());
            sublink.active = sublink.url === anchor;
          });
        }
      });
    }
  }

  async ngAfterViewInit() {
    const { src, step, wtid, ocid, vars } = getQueryParams();
    const repoPath = getRepoPath(src);
    if (!repoPath) {
      redirectRoutePath('', true);
      return;
    }

    this.loading = true;
    try {
      this.workshop = await loadWorkshop(repoPath, { wtid, ocid, vars });
      this.menuLinks = createMenuLinks(this.workshop);
      this.updateAuthors();
    } catch (error) {
      console.error(error);
    }
    this.loading = false;

    if (this.workshop && step) {
      this.workshop.step = Number(step);
    }
    addRouteChangeListener(this.routeChanged.bind(this));
  }

  updateAuthors() {
    if (this.workshop) {
      const rawAuthors = this.workshop.meta?.authors ?? [];
      const authors = Array.isArray(rawAuthors) ? rawAuthors : [rawAuthors];
      this.authors = `'${authors.join(', ')}'`;
    } else {
      this.authors = '';
    }
  }

  updateTitle() {
    if (this.workshop) {
      document.title = `${this.workshop.shortTitle} - ${this.workshop.sections[this.workshop.step].title}`;
    }
  }

  routeChanged(_route: Route) {
    const { step } = getQueryParams();
    const stepNumber = Number(step);
    if (this.workshop && step !== undefined) {
      if (this.workshop.step !== stepNumber) {
        this.workshop.step = stepNumber;
        scrollToTop('workshop');
      }
      this.enableScrollEvent = false;
      this.updateActiveLink();
      this.enableScrollUpdates();
    }
    this.updateTitle();
  }

  markdownReady() {
    // Push it down the event loop so that rendering has finished
    setTimeout(() => scrollToId(getHash().substring(1)));
  }

  enableScrollUpdates() {
    // Need to push this to the end of the event loop to avoid received triggers
    // from browser-generated scroll events
    setTimeout(() => (this.enableScrollEvent = true));
  }
}
