import { Component, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule, RouterModule],
  template: `
    <h3 class="text-center">Equipment Types</h3>
    <mat-list>
      <mat-list-item *ngFor="let tab of tabs">
        <span (click)="selectTab(tab)" class="tab-title">{{ tab.name }}</span>
        <button mat-icon-button color="warn" (click)="deleteTab(tab.id)">
          <mat-icon>delete</mat-icon>
        </button>
      </mat-list-item>
    </mat-list>

    <button mat-raised-button color="primary" (click)="addTab()">➕ Add Tab</button>
  `,
  styles: [`
    .tab-title {
      flex: 1;
      cursor: pointer;
    }
  `]
})
export class TabsComponent implements OnInit {
  tabs: any[] = [];
  selectedTab: any;

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    const tabsRef = collection(this.firestore, 'equipmentTabs');
    collectionData(tabsRef, { idField: 'id' }).subscribe((tabs) => {
      this.tabs = tabs;
    });
  }

  addTab() {
    const tabName = prompt('Enter new tab name:');
    if (tabName) {
      const tabsRef = collection(this.firestore, 'equipmentTabs');
      addDoc(tabsRef, { name: tabName });
    }
  }

  deleteTab(tabId: string) {
    const confirmDelete = confirm('Are you sure you want to delete this tab?');
    if (confirmDelete) {
      const tabRef = doc(this.firestore, `equipmentTabs/${tabId}`);
      deleteDoc(tabRef);
    }
  }

  selectTab(tab: any) {
    this.selectedTab = tab;
  }
}