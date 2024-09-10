import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/components/header.component';
import { FooterComponent } from '../shared/components/footer.component';
import { IconComponent } from '../shared/components/icon.component';
import { TypewriterComponent } from './typewriter.component';
import { githubRepositoryUrl, mainScrollableId } from '../shared/constants';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, TypewriterComponent, IconComponent],
  template: `
    <div class="full-viewport">
      <app-header logo="images/moaw-logo-dark.png" logoUrl="" type="landing" [links]="links"></app-header>
      <div class="content bg-light">
        <main id="${mainScrollableId}" class="scrollable">
          <section class="container no-sidebar">
            <div class="hero split-layout">
              <div class="hero-text">
                <h1>
                  Hands-on tutorials to <em>learn</em> and <em>teach</em>&nbsp;<app-typewriter
                    [words]="keywords"
                  ></app-typewriter>
                </h1>
                <p>
                  Grab-and-go resources to help you learn new skills, but also create, host and share your own workshop.
                </p>
                <p>
                  <a href="catalog/" class="button button-fill">Browse Workshops</a>
                </p>
              </div>
              <div class="show-gt-md">
                <img src="images/people/learner.svg" alt="person learning on a laptop" title="" />
              </div>
            </div>
          </section>
          <section class="container no-sidebar">
            <h2>What's <i>MOAW</i>?</h2>
            <!-- <p class="video-embed">
              <iframe width="560" height="315" src="https://www.youtube.com/embed/w-tLZjO6XMc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </p> -->
            <p>MOAW means <i>Mother Of All Workshops</i>, and it's the core of different resources.</p>
            <section class="panel">
              <div class="split-layout">
                <div class="item">
                  <h3>Catalog <app-icon name="search" size="28"></app-icon></h3>
                  <p>
                    It's a collection of all workshops and practical learning content created by developers and experts, aggregated in one place.
                  </p>
                  <p>
                    <a href="catalog/"><app-icon name="arrow-right"></app-icon>See all workshops</a>
                  </p>
                </div>
                <div class="item">
                  <h3>Platform <app-icon name="tools" size="28"></app-icon></h3>
                  <p>Use it to create and host workshops and associated sample code, slides, and resources.</p>
                  <p>
                    <a href="https://microsoft.github.io/moaw/workshop/create-workshop/"
                      ><app-icon name="arrow-right"></app-icon>How to create and host your workshop</a
                    >
                  </p>
                </div>
                <div class="item">
                  <h3>Community <app-icon name="code-of-conduct" size="28"></app-icon></h3>
                  <p>
                    This is a community-driven project, where everyone can use, adapt and share the content using the
                    permissive Creative Commons License.
                  </p>
                  <p>
                    <a href="${githubRepositoryUrl}/blob/main/CONTRIBUTING.md"
                      ><app-icon name="arrow-right"></app-icon>Contributing guide</a
                    >
                  </p>
                </div>
              </div>
            </section>
            <section>
              <h2>Want your workshop here?</h2>
              <p>You already have a workshop? ✨<b>Awesome!</b>✨ There are two options to add it to the catalog:</p>
              <div class="split-layout">
                <div class="item">
                  <h3>Reference it <app-icon name="link-external" size="28"></app-icon></h3>
                  <p>
                    If you already have a workshop hosted somewhere else, you can reference it in the catalog. This is
                    the easiest way to get started, and the process takes only a few minutes.
                  </p>
                  <p>
                    <a
                      class="button button-fill"
                      href="${githubRepositoryUrl}/blob/main/CONTRIBUTING.md#reference-an-existing-workshop"
                      ><app-icon name="arrow-right"></app-icon>How to reference your workshop</a
                    >
                  </p>
                </div>
                <div class="item">
                  <h3>Convert it <app-icon name="sync" size="28"></app-icon></h3>
                  <p>
                    If you want get the full benefits of our platform, such as <b>translations</b>, <b>extra pages</b>,
                    <b>analytics</b> and more, you can convert it to our workshop format. If you're already using
                    markdown, it's a breeze!
                  </p>
                  <p>
                    <a
                      class="button button-fill"
                      href="${githubRepositoryUrl}/blob/main/CONTRIBUTING.md#convert-an-existing-workshop"
                      ><app-icon name="arrow-right"></app-icon>How to convert your workshop</a
                    >
                  </p>
                </div>
              </div>
            </section>
          </section>
          <p>&nbsp;</p>
          <app-footer type="big" credits="People illustrations by Storyset"></app-footer>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      @import '../../theme/variables';

      .hero {
        font-size: var(--text-size-lg);

        h1 {
          font-size: var(--text-size-xxxxl);
        }

        p {
          margin: var(--space-lg) 0;
        }

        em {
          color: var(--primary);
          font-style: normal;
        }

        .button {
          font-weight: bold;
          padding: var(--space-md) var(--space-lg);
        }
      }

      .hero-text {
        flex: 1.5;
      }

      h2 {
        font-size: var(--text-size-xxxl);
        margin: var(--space-lg) 0;
        border: none;
        padding: 0;
      }

      .panel {
        margin: var(--space-lg) 0;
        background: var(--neutral-light);
        padding: var(--space-lg);
        border-radius: var(--border-radius);
        overflow: hidden;

        h3 {
          font-size: var(--text-size-xxl);
          margin-top: var(--space-lg);
        }

        h3 > app-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          margin-top: -8px;
        }

        .item:nth-child(1) {
          app-icon,
          a,
          a:hover {
            color: var(--accent-2);
          }

          h3 > app-icon {
            background: var(--accent-2);
            color: var(--text-light);
          }
        }

        .item:nth-child(2) {
          app-icon,
          a,
          a:hover {
            color: var(--accent-3);
          }

          h3 > app-icon {
            background: var(--accent-3);
            color: var(--text-light);
          }
        }

        .item:nth-child(3) {
          app-icon,
          a,
          a:hover {
            color: var(--accent);
          }

          h3 > app-icon {
            background: var(--accent);
            color: var(--text-light);
          }
        }
      }

      app-icon {
        line-height: 1.5em;
        margin-right: var(--space-xxs);
      }

      h3 > app-icon {
        float: left;
        margin-right: var(--space-md);
        color: var(--primary);
      }
    `
  ]
})
export class HomeComponent {
  links = [
    { text: 'Workshops', url: 'catalog/', icon: 'rocket' },
    { text: 'Contribute', url: `${githubRepositoryUrl}/blob/main/CONTRIBUTING.md`, icon: 'git-pull-request' },
    { text: 'GitHub', url: githubRepositoryUrl, icon: 'mark-github' }
  ];

  // TODO: Extract from tags
  keywords = [
    'JavaScript',
    'C#',
    'cloud computing',
    '.NET',
    'machine learning',
    'Python',
    'serverless',
    'HTML',
    'CSS',
    'APIs',
    'IoT',
    'databases',
    'containers',
    'quantum computing'
  ];
}
