import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { getQueryParams } from '../router';
import { HeaderComponent } from '../shared/header.component';
import { Workshop, loadWorkshop } from './workshop';
import { PaginationComponent } from './pagination.component';

@Component({
  selector: 'app-workshop',
  standalone: true,
  imports: [CommonModule, MarkdownModule, HeaderComponent, PaginationComponent],
  template: `
    <app-header [title]="workshop?.meta?.title || 'Workshop'"></app-header>
    <div *ngIf="workshop; else noWorkshop" class="workshop">
      <markdown ngPreserveWhitespaces [data]="workshop.sections[workshop.step].markdown"></markdown>
      <app-pagination [workshop]="workshop"></app-pagination>
    </div>
    <ng-template #noWorkshop>
      <p *ngIf="!loading">Could not load workshop :(</p>
    </ng-template>
  `,
  styles: [
    `
      :host {
        height: 100%;
      }
    `
  ]
})
export class WorkshopComponent implements OnInit {
  loading: boolean = true;
  workshop: Workshop | undefined;

  async ngOnInit() {
    const currentPath = decodeURIComponent(window.location.pathname);
    const { src, step, wtid, ocid } = getQueryParams();
    const repoPath = src ?? currentPath.substring('/workshop/'.length);

    this.loading = true;
    try {
      this.workshop = await loadWorkshop(repoPath, { wtid, ocid });
    } catch (error) {
      console.error(error);
    }
    this.loading = false;

    if (this.workshop && step) {
      this.workshop.step = Number(step);
    }
  }
}
