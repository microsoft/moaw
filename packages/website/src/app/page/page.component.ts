import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { HeaderComponent } from '../shared/components/header.component';
import { FooterComponent } from '../shared/components/footer.component';
import { LoaderComponent } from '../shared/components/loader.component';
import { CopyComponent } from '../shared/components/copy.component';
import { getRepoPath } from '../shared/loader';
import { loadPage, Page } from './page';
import { getQueryParams } from '../router';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [CommonModule, MarkdownModule, HeaderComponent, FooterComponent, LoaderComponent, CopyComponent],
  template: `
    <div class="full-viewport">
      <app-header [title]="page?.shortTitle || page?.title"></app-header>
      <main class="content">
        <app-loader [loading]="loading" id="page" class="scrollable" [class.container]="loading">
          <div *ngIf="page; else noPage" class="container no-sidebar">
            <markdown
              ngPreserveWhitespaces
              [data]="page.markdown"
              clipboard
              [clipboardButtonComponent]="copyComponent"
            ></markdown>
          </div>
          <app-footer></app-footer>
        </app-loader>
      </main>
      <ng-template #noPage>
        <p class="container" *ngIf="!loading">Could not load page :(</p>
      </ng-template>
    </div>
  `,
  styles: [``]
})
export class PageComponent implements OnInit {
  readonly copyComponent = CopyComponent;
  loading: boolean = true;
  page: Page | undefined;

  async ngOnInit() {
    const { src, wtid, ocid, vars } = getQueryParams();
    const repoPath = getRepoPath(src);

    this.loading = true;
    try {
      this.page = await loadPage(repoPath, { wtid, ocid, vars });
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
  }
}
