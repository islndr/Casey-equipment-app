import { bootstrapApplication } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideRouter } from '@angular/router';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from './environments/environment';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)), // ✅ Initialize Firebase
    provideAuth(() => getAuth()), // ✅ Provide Firebase Authentication
    provideRouter(routes), // ✅ Enables Angular routing
  ],
}).catch(err => console.error(err));





