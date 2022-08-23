import 'zone.js';
import { enableProdMode, importProvidersFrom, SecurityContext } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { MarkdownModule } from 'ngx-markdown';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      MarkdownModule.forRoot({
        sanitize: SecurityContext.NONE
      })
    )
  ]
}).catch((err) => console.error(err));
