import 'zone.js';
import { enableProdMode, importProvidersFrom, SecurityContext } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { AppComponent } from './app/app.component';
import { markedOptionsFactory } from './app/shared/markdown';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      MarkdownModule.forRoot({
        sanitize: SecurityContext.NONE,
        markedOptions: {
          provide: MarkedOptions,
          useFactory: markedOptionsFactory
        }
      })
    )
  ]
}).catch((err) => console.error(err));
