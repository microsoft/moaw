import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/components/header.component';
import { FooterComponent } from '../shared/components/footer.component';
import { LoaderComponent } from '../shared/components/loader.component';
import { defaultLanguage, githubRepositoryUrl } from '../shared/constants';
import { getQueryParams } from '../router';
import { ContentEntry, loadCatalog } from './content-entry';
import { CardComponent } from './card.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, LoaderComponent, CardComponent],
  template: `
    <div class="full-viewport">
      <app-header logo="images/moaw-logo-full.png" logoUrl="" [links]="links"></app-header>
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
              <app-card *ngFor="let workshop of filteredWorkshops" [workshop]="workshop"></app-card>
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
    this.filteredWorkshops = this.workshops.filter((workshop) => workshop.language === lang);
  }

  filter(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    console.log(text);
  }
}
