import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

import { getQueryParams } from '../router';
import { Workshop, loadWorkshop } from './workshop';

@Component({
  selector: 'app-workshop',
  standalone: true,
  imports: [CommonModule, MarkdownModule],
  template: `
    <header class="navbar">
      <div class="links">
        <a href="#">GitHub</a>
      </div>
    </header>
    <div *ngIf="workshop; else noWorkshop" class="workshop">
      <markdown ngPreserveWhitespaces [data]="workshop.sections[workshop.step]"></markdown>
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
    const repoPath = currentPath.substring('/workshop/'.length);
    const { step, wtid, ocid } = getQueryParams();

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
