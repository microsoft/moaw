import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/components/header.component';
import { FooterComponent } from '../shared/components/footer.component';
import { githubRepositoryUrl } from '../shared/constants';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  template: `
    <div class="full-viewport">
      <app-header logo="images/moaw-logo-full.png" [links]="links"></app-header>
      <div class="content">
        <div class="scrollable">
          <div class="container no-sidebar">
            <h1>Workshops</h1>
          </div>
        </div>
      </div>
      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class CatalogComponent implements OnInit {
  links = [{ text: 'GitHub', url: githubRepositoryUrl, icon: 'mark-github' }];

  constructor() {}

  ngOnInit(): void {}
}
