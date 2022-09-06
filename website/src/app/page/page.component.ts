import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { HeaderComponent } from '../shared/components/header.component';
import { FooterComponent } from '../shared/components/footer.component';
import { getRepoPath } from '../shared/loader';
import { loadPage, Page } from './page';
import { getQueryParams } from '../router';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [CommonModule, MarkdownModule, HeaderComponent, FooterComponent],
  template: `
    <div class="full-viewport">
      <app-header [title]="page?.shortTitle || page?.title"></app-header>
      <div class="content">
        <div id="page" *ngIf="page; else noPage" class="scrollable">
          <div class="container no-sidebar">
            <markdown ngPreserveWhitespaces [data]="page.markdown"></markdown>
          </div>
          <app-footer></app-footer>
        </div>
      </div>
      <ng-template #noPage>
        <p class="container" *ngIf="!loading">Could not load page :(</p>
      </ng-template>
    </div>
  `,
  styles: [``]
})
export class PageComponent implements OnInit {
  loading: boolean = true;
  page: Page | undefined;

  async ngOnInit() {
    const { src, wtid, ocid } = getQueryParams();
    const repoPath = getRepoPath(src);

    this.loading = true;
    try {
      this.page = await loadPage(repoPath, { wtid, ocid });
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
  }
}
