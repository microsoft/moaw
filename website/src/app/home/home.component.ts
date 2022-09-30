import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/components/header.component';
import { FooterComponent } from '../shared/components/footer.component';
import { githubRepositoryUrl } from '../shared/constants';


@Component({
  selector: 'app-home', 
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  template: `
    <div class="full-viewport">
      <app-header logo="images/moaw-logo-dark.png" logoUrl="" type="landing" [links]="links"></app-header>
      <div class="content bg-light">
        <div class="scrollable">
          <section class="container no-sidebar">
            <div class="hero split">
              <div>
                <h1>Hands-on projets to <em>learn</em> and <em>teach</em> Microsoft technologies.</h1>
                <p>Grab-and-go resources to help you learn new skills, but also create, host and share your own workshop.</p>
                <p>
                  <button class="button-fill">Browse Workshops</button>
                </p>
              </div>
              <div class="image"></div>
            </div>
          </section>
          <section class="container no-sidebar">
            <h1>What's MOAW?</h1>
            <p>VIDEO HERE<br><br><br><br><br><br><br></p>
            <h4>The Mother of All Workshops is a...</h4>
            <div class="split">
              <div>
                <h2>Catalog</h2>
                <p>It's a collection of all workshops and practical learning content created by developers from Microsoft and its community, aggregated in one place.</p>
                <p><a href="catalog/">See all workshops</a></p>
              </div>
              <div>
                <h2>Platform</h2>
                <p>Use it to create and host workshops and associated sample code, slides, and resources.</p>
                <p><a href="catalog/">How to create and host your workshop</a></p>
              </div>
              <div>
                <h2>Community</h2>
                <p>This is a community-driven project, where everyone can use, adapt and share the content using the permissive Creative Commons License.</p>
                <p><a href="catalog/">Contributing guide</a></p>
              </div>
            </div>
            <h1>Want to add your workshop here?</h1>
            <p>That's great! You have two options: TODO [reference or convert]</p>
          </section>
          <div class="fill"></div>
          <app-footer type="big"></app-footer>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .scrollable {
        display: flex;
        flex-direction: column;
      }

    em {
      color: var(--primary);
      font-style: normal;
    }

    .hero {
      h1 {
        font-size: 2.5rem;
      }

      .image {
        background: url('/moaw/images/bg-dots.svg') no-repeat center center;
        background-size: cover;
      }
    }

    .split {
      display: flex;
      flex-direction: row;

      > * {
        flex: 1;
      }
    }
    `
  ]
})
export class HomeComponent implements OnInit {
  links = [
    { text: 'Home', url: '', icon: 'home-fill' },
    { text: 'Workshops', url: 'catalog/', icon: 'rocket' },
    { text: 'Contribute', url: `${githubRepositoryUrl}/blob/main/CONTRIBUTING.md`, icon: 'git-pull-request' },
    { text: 'GitHub', url: githubRepositoryUrl, icon: 'mark-github' }
  ];
  
  constructor() { }

  ngOnInit(): void {
  }

}
