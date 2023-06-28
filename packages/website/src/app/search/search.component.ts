import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule],
  template: ` <iframe [src]="searchUrl" title="AI search"></iframe> `,
  styles: [
    `
      iframe {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        border: none;
      }
    `
  ]
})
export class SearchComponent {
  searchUrl: SafeUrl;

  constructor(sanitizer: DomSanitizer) {
    this.searchUrl = sanitizer.bypassSecurityTrustResourceUrl(environment.searchUrl);
  }
}
