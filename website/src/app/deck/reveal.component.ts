import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { injectCode, loadScripts, loadStyles } from '../shared/loader';
import { Deck } from './deck';

@Component({
  selector: 'app-reveal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reveal">
      <div class="slides">
        <section data-markdown>
          <div data-template hidden>{{ deck?.markdown }}</div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  `]
})
export class RevealComponent {
  @Input() deck: Deck | undefined;

  async ngAfterViewInit() {
    await loadStyles([
      'reveal.js/dist/reset.css',
      'reveal.js/dist/reveal.css',
      'reveal.js/dist/theme/black.css',
      'reveal.js/plugin/highlight/monokai.css'
    ]);
    await loadScripts([
      'reveal.js/dist/reveal.js',
      'reveal.js/plugin/notes/notes.js',
      'reveal.js/plugin/markdown/markdown.js',
      'reveal.js/plugin/highlight/highlight.js'
    ]);
    injectCode(`
      Reveal.initialize({
        plugins: [RevealMarkdown, RevealHighlight, RevealNotes]
      });
    `);
  }
}
