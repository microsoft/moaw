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
    <div *ngIf="workshop; else noWorkshop">
      <markdown ngPreserveWhitespaces [data]="workshop.sections[workshop.step]"></markdown>
    </div>
    <ng-template #noWorkshop>
      <p *ngIf="!loading">Could not load workshop :(</p>
    </ng-template>
  `,
  styles: [
  ]
})
export class WorkshopComponent implements OnInit {
  loading: boolean = true;
  workshop: Workshop|undefined;

  async ngOnInit() {
    const currentPath = decodeURIComponent(window.location.pathname);
    const repoPath = currentPath.substring('/workshop/'.length);
  
    this.workshop = await loadWorkshop(repoPath);

    if (this.workshop) {
      const queryParams = getQueryParams();
      const step = queryParams?.['step'];
      if (step) {
        this.workshop.step = Number(step);
      }
    }
  }
}
