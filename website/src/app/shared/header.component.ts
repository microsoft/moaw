import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="navbar">
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
