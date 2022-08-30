import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OcticonDirective } from './octicon.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, OcticonDirective],
  template: `
    <header class="navbar">
      <i octicon="three-bars" size="24"></i>
      <div class="title">{{ title }}</div>
      <div class="links">
        <a *ngFor="let link of links" href="#">GitHub</a>
      </div>
    </header>
  `,
  styles: [`

  `]
})
export class HeaderComponent {
  @Input() title: string | undefined;
  @Input() links: string[] = [];
}
