import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { addRouteChangeListener, getQueryParams, Route } from '../router';
import { HeaderComponent } from '../shared/components/header.component';
import { SidebarComponent } from '../shared/components/sidebar.component';
import { Workshop, loadWorkshop, createMenuLinks } from './workshop';
import { PaginationComponent } from './pagination.component';
import { MenuLink } from '../shared/link';

@Component({
  selector: 'app-workshop',
  standalone: true,
  imports: [CommonModule, MarkdownModule, HeaderComponent, SidebarComponent, PaginationComponent],
  template: `
    <div (click)="sidebar.toggleOpen(false)">
      <app-header [title]="workshop?.shortTitle || 'Workshop'" [sidebar]="sidebar"></app-header>
      <app-sidebar #sidebar="sidebar" [links]="menuLinks"></app-sidebar>
      <div *ngIf="workshop; else noWorkshop" class="workshop">
        <markdown ngPreserveWhitespaces [data]="workshop.sections[workshop.step].markdown"></markdown>
        <app-pagination [workshop]="workshop"></app-pagination>
      </div>
      <ng-template #noWorkshop>
        <p *ngIf="!loading">Could not load workshop :(</p>
      </ng-template>
    </div>
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

    addRouteChangeListener(this.routeChanged.bind(this));
  }

  routeChanged(_route: Route) {
    const { step } = getQueryParams();
    const stepNumber = Number(step);
    if (this.workshop && step && this.workshop.step !== stepNumber) {
      this.workshop.step = stepNumber;
    }
  }

  get menuLinks(): MenuLink[] {
    if (!this.workshop) {
      return [];
    }

    return createMenuLinks(this.workshop);
  }
}
