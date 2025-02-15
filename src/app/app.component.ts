// 🚀 Root Component for the application
// This acts as a container for the entire app and uses <router-outlet> for navigation
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true, // ✅ No AppModule needed
  imports: [RouterModule], // Import RouterModule
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'casey-equipment-app';
}




