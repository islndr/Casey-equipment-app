import { Component, OnInit } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-ios-contact',
  standalone: true,
  templateUrl: './ios-contact.component.html',
  styleUrls: ['./ios-contact.component.css'],
  imports: [CommonModule] // ⬅️ Add this to enable AsyncPipe and NgFor
})
export class IOSContactComponent implements OnInit {
  tabTitle = 'Contact Us';
  contacts$!: Observable<any[]>;

  constructor(private firestore: Firestore, private router: Router) {}



  ngOnInit() {
    const contactsRef = collection(this.firestore, 'contacts');
    this.contacts$ = collectionData(contactsRef, { idField: 'id' });
  }
  goBack() {
    this.router.navigate(['/iostabs']);
  }
  encode(value: string): string {
    return encodeURIComponent(value);
  }
  // Add this method to the component class
toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}
}