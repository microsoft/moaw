import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { addRouteChangeListener, Route, setupRouter } from './router';
import { WorkshopComponent } from './workshop/workshop.component';
import { DeckComponent } from './deck/deck.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, WorkshopComponent, DeckComponent],
  template: `
    <app-workshop *ngIf="route?.id === 'workshop'"></app-workshop>
    <app-deck *ngIf="route?.id === 'deck'"></app-deck>
  `,
  styles: []
})
export class AppComponent {
  route: Route | undefined;

  constructor() {
    addRouteChangeListener(this.routeChanged.bind(this));
    setupRouter();
  }

  routeChanged(route: Route) {
    this.route = route;
  }
}
