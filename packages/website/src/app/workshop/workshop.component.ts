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
      this.loadLanguages(repoPath);
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

  loadLanguages(repoPath: string) {
    if (!this.workshop) {
      return;
    }

    // Get current language from metadata or detect from path
    const languageFromMeta = this.workshop.meta?.language;
    const languageFromPath = this.getLanguageFromPath(repoPath);
    this.currentLanguage = languageFromMeta || languageFromPath || defaultLanguage;

    // Get translations from metadata
    const translationsMeta = this.workshop.meta?.translations;
    if (!translationsMeta || (Array.isArray(translationsMeta) && translationsMeta.length === 0)) {
      // No translations defined
      return;
    }

    // Parse translations array
    const translationCodes = Array.isArray(translationsMeta) 
      ? translationsMeta 
      : translationsMeta.split(',').map(t => t.trim());

    // Build language options
    const languages: LanguageOption[] = [];

    // Determine base path
    const basePath = this.getBasePath(repoPath, languageFromPath);

    // Add base language first (always labeled as "default")
    const baseLanguage = languageFromMeta || defaultLanguage;
    languages.push({
      code: baseLanguage,
      label: `default (${baseLanguage})`,
      url: this.buildWorkshopUrl(basePath, null)
    });

    // Add translations sorted alphabetically
    const sortedTranslations = [...translationCodes].sort((a, b) => a.localeCompare(b));
    for (const langCode of sortedTranslations) {
      languages.push({
        code: langCode,
        label: langCode,
        url: this.buildWorkshopUrl(basePath, langCode)
      });
    }

    // Only show language selector if there are translations
    if (languages.length > 1) {
      this.languages = languages;
    }
  }

  getLanguageFromPath(repoPath: string): string | null {
    // Extract language code from path like "workshop.fr.md" or "translations/workshop.ja.md"
    const match = repoPath.match(/\.([a-zA-Z]{2}(?:_[A-Z]{2})?)\.md$/);
    return match ? match[1] : null;
  }

  getBasePath(repoPath: string, currentLang: string | null): string {
    // Remove language code and extension from path to get base path
    if (currentLang) {
      // Path is like "workshops/my-workshop/translations/workshop.fr.md"
      // or "workshops/my-workshop/workshop.fr.md"
      // Use simple string replacement to avoid regex issues
      const suffix = `.${currentLang}.md`;
      if (repoPath.endsWith(suffix)) {
        return repoPath.slice(0, -suffix.length) + '.md';
      }
      // Also handle translations folder
      return repoPath.replace('/translations/', '/');
    }
    // Already a base path
    return repoPath;
  }

  buildWorkshopUrl(basePath: string, langCode: string | null): string {
    const { step, wtid, ocid, vars } = getQueryParams();
    let workshopPath = basePath;

    if (langCode) {
      // Build translation path: insert "translations/" folder and language code
      // basePath could be like "workshops/my-workshop/workshop.md" or "my-workshop/"
      if (workshopPath.endsWith('.md')) {
        const parts = workshopPath.split('/');
        const fileName = parts.pop() || '';
        const baseName = fileName.replace('.md', '');
        workshopPath = `${parts.join('/')}/translations/${baseName}.${langCode}.md`;
      } else {
        // Handle directory path
        workshopPath = `${workshopPath}translations/workshop.${langCode}.md`;
      }
    }

    // Build query string
    const params = new URLSearchParams();
    if (step) params.set('step', step);
    if (wtid) params.set('wtid', wtid);
    if (ocid) params.set('ocid', ocid);
    if (vars) params.set('vars', vars);
    
    const queryString = params.toString();
    const baseUrl = `${window.location.origin}${window.location.pathname.split('?')[0]}`;
    
    return `${baseUrl}?src=${encodeURIComponent(workshopPath)}${queryString ? '&' + queryString : ''}`;
  }
}
