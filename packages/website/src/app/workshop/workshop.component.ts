import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { addRouteChangeListener, getHash, getQueryParams, redirectRoutePath, Route, setHash } from '../router';
import { HeaderComponent } from '../shared/components/header.component';
import { FooterComponent } from '../shared/components/footer.component';
import { SidebarComponent } from '../shared/components/sidebar.component';
import { LoaderComponent } from '../shared/components/loader.component';
import { CopyComponent } from '../shared/components/copy.component';
import { LanguageOption } from '../shared/components/language-selector.component';
import { Workshop, loadWorkshop, createMenuLinks } from './workshop';
import { PaginationComponent } from './pagination.component';
import { MenuLink } from '../shared/link';
import { debounce } from '../shared/event';
import { scrollToId, scrollToTop } from '../shared/scroll';
import { getRepoPath } from '../shared/loader';
import { loadCatalog, ContentEntry } from '../catalog/content-entry';
import { defaultLanguage } from '../shared/constants';

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
      <app-header [title]="workshop?.shortTitle || 'Workshop'" [sidebar]="sidebar" [languages]="languages" [currentLanguage]="currentLanguage"></app-header>
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
  languages: LanguageOption[] = [];
  currentLanguage: string = defaultLanguage;

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
      await this.loadLanguages(repoPath);
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

  async loadLanguages(repoPath: string) {
    try {
      const catalog = await loadCatalog();
      const normalizedRepoPath = this.normalizeRepoPath(repoPath);
      
      // Find the workshop entry - either as a main entry or as a translation
      let workshopEntry: ContentEntry | undefined;
      let baseEntry: ContentEntry | undefined;
      let isTranslation = false;

      // First, try to find as a main entry
      workshopEntry = catalog.find(entry => {
        const entryPath = this.normalizeRepoPath(entry.url);
        return entryPath === normalizedRepoPath;
      });

      if (workshopEntry) {
        // Found as main entry
        baseEntry = workshopEntry;
      } else {
        // Not found as main entry, check if it's a translation
        for (const entry of catalog) {
          if (entry.translations?.some(t => this.normalizeRepoPath(t.url) === normalizedRepoPath)) {
            baseEntry = entry;
            isTranslation = true;
            break;
          }
        }
      }

      if (!baseEntry) {
        // Not found at all
        return;
      }

      // Get the current language
      this.currentLanguage = this.workshop?.meta?.language || 
                             (isTranslation ? normalizedRepoPath.match(/\.([a-z]{2}(?:_[A-Z]{2})?)\.md$/)?.[1] : undefined) ||
                             baseEntry.language || 
                             defaultLanguage;

      // Build language options
      const languages: LanguageOption[] = [];

      // Add the base language first (always labeled as "default")
      const baseLanguage = baseEntry.language || defaultLanguage;
      languages.push({
        code: baseLanguage,
        label: `default (${baseLanguage})`,
        url: this.getWorkshopUrl(baseEntry.url)
      });

      // Add translations sorted alphabetically
      if (baseEntry.translations && baseEntry.translations.length > 0) {
        const sortedTranslations = [...baseEntry.translations].sort((a, b) => 
          a.language.localeCompare(b.language)
        );

        for (const translation of sortedTranslations) {
          languages.push({
            code: translation.language,
            label: translation.language,
            url: this.getWorkshopUrl(translation.url)
          });
        }
      }

      // Only show language selector if there are translations
      if (languages.length > 1) {
        this.languages = languages;
      }
    } catch (error) {
      console.error('Failed to load languages:', error);
    }
  }

  normalizeRepoPath(path: string): string {
    // Handle both relative paths and full URLs
    let normalized: string;
    
    if (path.startsWith('http')) {
      // Full URL - extract the path after /workshop/
      const url = new URL(path);
      normalized = url.pathname.replace(/^.*\/workshop\//, '');
    } else {
      // Relative path - use as is
      normalized = path;
    }
    
    // Ensure trailing slash for consistency (unless it's a .md file)
    if (!normalized.endsWith('/') && !normalized.endsWith('.md')) {
      normalized += '/';
    }
    
    return normalized;
  }

  getWorkshopUrl(catalogUrl: string): string {
    // The catalog URL is either a full URL or a relative path
    if (catalogUrl.startsWith('http')) {
      // Full URL - extract and use as is
      const url = new URL(catalogUrl);
      return url.pathname + url.search;
    } else {
      // Relative path - construct workshop URL with src parameter
      return `/workshop/?src=${encodeURIComponent(catalogUrl)}`;
    }
  }
}
