import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealComponent } from './reveal.component';
import { getQueryParams } from '../router';
import { Deck, loadDeck } from './deck';
import { getRepoPath } from '../shared/loader';

@Component({
  selector: 'app-deck',
  standalone: true,
  imports: [CommonModule, RevealComponent],
  template: `
    <main *ngIf="deck; else noDeck" class="deck">
      <app-reveal [deck]="deck"></app-reveal>
    </main>
    <ng-template #noDeck>
      <p *ngIf="!loading">Could not load slide deck :(</p>
    </ng-template>
  `,
  styles: [``]
})
export class DeckComponent implements OnInit {
  loading: boolean = true;
  deck: Deck | undefined;

  async ngOnInit() {
    const { src, slide, wtid, ocid, vars } = getQueryParams();
    const repoPath = getRepoPath(src);

    this.loading = true;
    try {
      this.deck = await loadDeck(repoPath, { wtid, ocid, vars });
    } catch (error) {
      console.error(error);
    }
    this.loading = false;

    if (this.deck && slide) {
      this.deck.slide = Number(slide);
    }
  }
}
