import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { addRouteChangeListener, Route, setupRouter } from './router';
import { WorkshopComponent } from './workshop/workshop.component';
import { DeckComponent } from './deck/deck.component';
import { PageComponent } from './page/page.component';
import { CatalogComponent } from './catalog/catalog.component';
import { HomeComponent } from './home/home.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, WorkshopComponent, DeckComponent, PageComponent, CatalogComponent, HomeComponent],
  template: `
    <div [ngSwitch]="route?.id">
      <app-workshop *ngSwitchCase="'workshop'"></app-workshop>
      <app-deck *ngSwitchCase="'deck'"></app-deck>
      <app-page *ngSwitchCase="'page'"></app-page>
      <app-catalog *ngSwitchCase="'catalog'"></app-catalog>
      <app-home *ngSwitchDefault></app-home>
    </div>
  `,
  styles: []
})
export class AppComponent {
  route: Route | undefined;

  constructor() {
    setupRouter();
    addRouteChangeListener(this.routeChanged.bind(this));
  }

  routeChanged(route: Route) {
    this.route = route;
  }
}
