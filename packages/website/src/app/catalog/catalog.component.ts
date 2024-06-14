import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/components/header.component';
import { FooterComponent } from '../shared/components/footer.component';
import { LoaderComponent } from '../shared/components/loader.component';
import { ChipComponent } from '../shared/components/chip.component';
import { defaultLanguage, githubRepositoryUrl, mainScrollableId } from '../shared/constants';
import {
  addRouteChangeListener,
  getQueryParams,
  removeRouteChangeListener,
  RouteChangeListener,
  setQueryParams
} from '../router';
import { ContentEntry, loadCatalog } from './content-entry';
import { ContentFilter, matchEntry } from './content-filter';
import { CardComponent } from './card.component';
import { BehaviorSubject, concat, debounceTime, distinctUntilChanged, map, Observable, take } from 'rxjs';

const pageTitle = 'MOAW - All Workshops';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, LoaderComponent, ChipComponent, CardComponent],
  template: `
    <div class="full-viewport">
      <app-header logo="images/moaw-logo-full.png" logoUrl="" [links]="links"></app-header>
      <div class="content bg-light">
        <main id="${mainScrollableId}" class="scrollable">
          <section class="hero">
            <div class="container no-sidebar">
              <!-- <h1>All Workshops</h1> -->
              <div class="split">
                <!-- <p>Browse through our collection of workshops to learn new skills and improve your knowledge.</p> -->
                <input
                  type="search"
                  placeholder="Search workshops"
                  (search)="searchText($event)"
                  (keyup)="searchText($event)"
                  aria-label="Search workshops"
                  class="search"
                  [value]="search"
                />
                <!-- <span class="small">or filter by tag:</span> -->
                <div class="tags-filter">
                  <app-chip *ngFor="let tag of tags" (click)="removeTagFilter(tag)" type="clickable removable">
                    {{ tag }}
                  </app-chip>
                </div>
              </div>
            </div>
          </section>
          <app-loader class="container no-sidebar" [loading]="loading">
            <div role="status" class="results" role="status">
              <span *ngIf="(filteredWorkshops$ | async)?.length; let workshopCount; else: noResults"
                >{{ workshopCount }} workshop{{ workshopCount === 1 ? '' : 's' }}</span
              >
              <ng-template #noResults>No workshops match your search criteria.</ng-template>
            </div>
            <div class="cards">
              <app-card
                *ngFor="let workshop of filteredWorkshops$ | async; trackBy: trackById"
                [workshop]="workshop"
                (clickTag)="addTagFilter($event)"
              ></app-card>
            </div>
          </app-loader>
          <div class="fill"></div>
          <app-footer type="big"></app-footer>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .scrollable {
        display: flex;
        flex-direction: column;
      }

      .bg-light {
        background: var(--neutral-light);
      }

      .hero {
        background: var(--background);
        box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
      }

      .search {
        padding: var(--space-xs);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        width: 100%;
        max-width: 300px;
      }

      .tags-filter {
        margin-top: var(--space-xxs);
        text-transform: lowercase;
      }

      .cards {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        grid-gap: var(--space-md);
        padding: var(--space-md) 0;
      }
    `
  ]
})
export class CatalogComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  links = [{ text: 'GitHub', url: githubRepositoryUrl, icon: 'mark-github' }];
  workshops: ContentEntry[] = [];
  tags: string[] = [];
  search: string = '';
  sub: string[] = [];
  language: string = defaultLanguage;
  filter$ = new BehaviorSubject<ContentFilter>({ search: '', tags: [], language: defaultLanguage });
  filteredWorkshops$!: Observable<ContentEntry[]>;
  routeChangeListener!: RouteChangeListener;

  async ngOnInit() {
    document.title = pageTitle;
    this.loading = true;
    try {
      this.workshops = await loadCatalog();
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
    this.routeChangeListener = this.updateRoute.bind(this);

    addRouteChangeListener(this.routeChangeListener);
    this.filteredWorkshops$ = this.filterWorkshops();
  }

  ngOnDestroy() {
    removeRouteChangeListener(this.routeChangeListener);
  }

  updateRoute() {
    let { lang, tags, search, sub } = getQueryParams();
    this.tags = tags ? tags.split(',') : [];
    this.sub = sub ? sub.split(',') : [];
    this.language = lang ?? defaultLanguage;
    this.search = search ?? '';
    this.filter$.next({ search: this.search, tags: [...this.tags, ...this.sub], language: this.language });
    this.updateTitle(this.search);
  }

  filterWorkshops() {
    return concat(
      // Skip debounce time on first search
      this.filter$.pipe(take(1)),
      this.filter$.pipe(debounceTime(300))
    ).pipe(
      distinctUntilChanged(),
      map((filter) => this.workshops.filter((workshop) => matchEntry(workshop, filter)))
    );
  }

  searchText(event: Event) {
    const text = (event.target as HTMLInputElement).value?.trim();
    const hasSearchQuery = getQueryParams()['search']?.length > 0;
    const addToHistory = (text.length > 0 && !hasSearchQuery) || (text.length === 0 && hasSearchQuery);
    setQueryParams({ search: text.length > 0 ? text : undefined }, false, addToHistory);
    this.updateTitle(text);
  }

  addTagFilter(tag: string) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      setQueryParams({ tags: this.tags.length > 0 ? this.tags.join(',') : undefined });
    }
  }

  removeTagFilter(tag: string) {
    this.tags = this.tags.filter((t) => t !== tag);
    setQueryParams({ tags: this.tags.length > 0 ? this.tags.join(',') : undefined });
  }

  trackById(_index: number, workshop: ContentEntry) {
    return workshop.id;
  }

  private updateTitle(search: string) {
    document.title = pageTitle + (search.length > 0 ? ` - Search: ${search}` : '');
  }
}
