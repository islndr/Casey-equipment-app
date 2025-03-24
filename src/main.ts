import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from './environments/environment';
import { AuthGuard } from './app/guards/auth.guard';
import { PdfViewerComponent } from './app/components/ios-pdf-viewer/ios-pdf-viewer.component';
import { AppComponent } from './app/app.component';
import { IOSSpecSheetsComponent } from './app/components/ios-spec-sheets/ios-spec-sheets.component';



bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAuth(() => getAuth()),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)), 
    provideFirestore(() => getFirestore()),
    provideAnimations(),
    importProvidersFrom(BrowserAnimationsModule, MatSidenavModule, MatToolbarModule, MatListModule),
    PdfViewerComponent
  ]
  
}).catch(err => console.error(err));