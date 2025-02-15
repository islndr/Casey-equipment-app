import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { AppComponent } from '../components/app/app.component'; // Import AppComponent
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { routes } from './app.routes';  // Import your routes

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Provide router and routes
  ],
}).catch((err) => console.error(err));