import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';  
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ios-tabs',
  standalone: true,
  templateUrl: './ios-tabs.component.html',
  styleUrls: ['./ios-tabs.component.css'],
  imports: [CommonModule]
})
export class IOSTabsComponent implements OnInit {
  tabs$: Observable<any[]> = new Observable<any[]>(); // Stores the tabs data

  constructor(private firestore: Firestore, private router: Router) {}

  ngOnInit(): void {
    this.loadTabs();
  }

  /** ✅ Load Tabs from Firestore */
  private loadTabs(): void {
    const tabsRef = collection(this.firestore, 'tabs');
    this.tabs$ = collectionData(tabsRef, { idField: 'id' });
  }

/** ✅ Navigate to Spec Sheets Page */
navigateToSpecSheets(tabId: string): void {
  const url = `/spec-sheets/${tabId}`;
  console.log(`🔗 Navigating to: ${url}`);
  this.router.navigate([url]);
}
}