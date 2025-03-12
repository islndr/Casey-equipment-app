import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-ios',
  standalone: true,
  templateUrl: './ios-app.component.html',
  styleUrls: ['./ios-app.component.css'],
  imports: [CommonModule],
})
export class IOSAppComponent implements OnInit {
  tabs$!: Observable<any[]>;

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    this.loadTabs();
  }

  loadTabs() {
    this.tabs$ = collectionData(collection(this.firestore, 'tabs'), { idField: 'id' });
  }

  specSheet: any = null;

  loadSpecSheet(tabId: string) {
    const specSheetsRef = collection(this.firestore, 'specSheets');
    const queryRef = query(specSheetsRef, where('tabId', '==', tabId));

    collectionData(queryRef, { idField: 'id' }).subscribe(specSheets => {
      if (specSheets.length) {
        this.specSheet = specSheets[0];
      } else {
        this.specSheet = null;
      }
    });
  }
}






