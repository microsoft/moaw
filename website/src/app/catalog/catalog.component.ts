import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/components/header.component';
import { FooterComponent } from '../shared/components/footer.component';
import { LoaderComponent } from '../shared/components/loader.component';
import { defaultLanguage, githubRepositoryUrl } from '../shared/constants';
import { ContentEntry, loadCatalog } from './content-entry';
import { getQueryParams } from '../router';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, LoaderComponent],
  template: `
    <div class="full-viewport">
      <app-header logo="images/moaw-logo-full.png" [links]="links"></app-header>
      <div class="content bg-light">
        <div class="scrollable">
          <section class="hero">
            <div class="container no-sidebar">
              <h1>All Workshops</h1>
              <div class="split">
                <p>Browse through our collection of workshops to learn new skills and improve your knowledge.</p>
                <!-- <input type="text" placeholder="Search" (keyup)="filter($event)" aria-label="Search workshops" class="search"/> -->
              </div>
            </div>
          </section>
          <app-loader class="container no-sidebar" [loading]="loading">
            <div class="cards">
              <a [href]="workshop.url" class="card" *ngFor="let workshop of filteredWorkshops" [title]="workshop.description">
                <div class="banner" [style]="{ 'background-image': 'url(' + workshop.bannerUrl + ')' }">
                  <div *ngIf="workshop.duration" class="duration">{{ workshop.duration }} min</div>
                </div>
                <div class="title">{{ workshop.title }}</div>
                <div class="tags">{{ workshop.tags.slice(0, 4).join(', ') }}</div>
              </a>
            </div>
          </app-loader>
          <div class="fill"></div>
          <app-footer type="big"></app-footer>
        </div>
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

      .cards {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        grid-gap: var(--space-md);
        padding: var(--space-md) 0;
      }

      .card {
        display: flex;
        flex-direction: column;
        background: var(--background);
        border-radius: var(--border-radius);
        box-shadow: 0 0px 1px 0 rgba(0 0 0 / 20%), 0 2px 1px -1px rgba(0 0 0 / 10%), 0 2px 2px 0 rgba(0 0 0 / 10%);
        overflow: hidden;
        transition-property: box-shadow, transform;
        transition-duration: var(--transition-duration);
        color: var(--text);

        &:hover {
          text-decoration: none;
          transform: translate3d(0, -2px, 0);
          box-shadow: 0 5px 10px 0 rgb(0 0 0 / 20%);
        }
      }

      .banner {
        position: relative;
        height: 120px;
        background-color: var(--neutral-light);
        background-size: cover;
        background-repeat: no-repeat;
        background-position: 50%;

        img {
          margin: 0;
        }
      }

      .duration {
        position: absolute;
        right: var(--space-md);
        bottom: 0;
        transform: translateY(50%);
        font-size: 0.7em;
        padding: 0 var(--space-xs);
        border-radius: var(--border-radius);
        background: var(--neutral-dark);
        color: var(--text-light);
      }

      .title {
        flex: 1;
        font-weight: bold;
        margin: var(--space-md);
      }

      .tags {
        font-size: 0.85em;
        margin: var(--space-md);
        text-transform: lowercase;
        opacity: 0.7;
      }
    `
  ]
})
export class CatalogComponent implements OnInit {
  loading: boolean = true;
  links = [{ text: 'GitHub', url: githubRepositoryUrl, icon: 'mark-github' }];
  workshops: ContentEntry[] = [];
  filteredWorkshops: ContentEntry[] = [];

  async ngOnInit() {
    document.title = 'MOAW - All Workshops';
    this.loading = true;
    try {
      this.workshops = await loadCatalog();
    } catch (error) {
      console.error(error);
    }
    this.loading = false;

    let { lang } = getQueryParams();
    lang = lang || defaultLanguage;
    this.filteredWorkshops = this.workshops.filter(workshop => workshop.language === lang);
  }

  filter(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    console.log(text);
  }
}
