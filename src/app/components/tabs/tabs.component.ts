import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc, updateDoc, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { SpecSheetTableComponent } from '../spec-sheet-table/spec-sheet-table.component';

interface Tab {
  id: string;
  name: string;
  order: number;
}

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css'],
  imports: [CommonModule, SpecSheetTableComponent],
})
export class TabsComponent implements OnInit {
  tabs$: Observable<Tab[]>;
  tabsArr: Tab[] = [];
  activeTabId: string | null = null;

  constructor(private firestore: Firestore) {
    const tabsRef = collection(this.firestore, 'tabs');
    const tabsQuery = query(tabsRef, orderBy('order', 'asc')); // Fetch tabs sorted by order
    this.tabs$ = collectionData(tabsQuery, { idField: 'id' }) as Observable<Tab[]>;
  }

  ngOnInit(): void {
    this.tabs$.subscribe(tabs => {
      this.tabsArr = tabs;
      if (tabs.length > 0) {
        this.activeTabId = this.activeTabId || tabs[0].id; // Default to first tab if not set
        this.switchTab(this.activeTabId);
      }
    });
  }


  /** ✅ Add a New Tab */
  async addTab() {
    const tabName = prompt('Enter tab name:');
    if (!tabName) return;

    const newTabId = crypto.randomUUID();
    const newTab: Tab = { id: newTabId, name: tabName, order: Date.now() }; // Using timestamp for order

    const tabRef = doc(this.firestore, `tabs/${newTab.id}`);
    await setDoc(tabRef, newTab);

    // ✅ Automatically create a spec sheet for this tab
    const newSpecSheet = { id: crypto.randomUUID(), tabId: newTabId };
    const specSheetRef = doc(this.firestore, `specSheets/${newSpecSheet.id}`);
    await setDoc(specSheetRef, newSpecSheet);

    console.log(`✅ Created spec sheet for new tab: ${newTabId}`);
  }

  /** ✅ Edit Tab Name */
  async editTab(tab: Tab) {
    const newName = prompt('Enter new name for this tab:', tab.name);
    if (!newName || newName.trim() === '') return;

    const tabRef = doc(this.firestore, `tabs/${tab.id}`);
    await updateDoc(tabRef, { name: newName });
  }

  /** ✅ Move Tab Up */
  async moveTabLeft(index: number, tabs: Tab[]) {
    if (index === 0) return; // Already first tab, can't move up

    const currentTab = tabs[index];
    const previousTab = tabs[index - 1];

    const currentTabRef = doc(this.firestore, `tabs/${currentTab.id}`);
    const previousTabRef = doc(this.firestore, `tabs/${previousTab.id}`);

    // Swap orders
    await updateDoc(currentTabRef, { order: previousTab.order });
    await updateDoc(previousTabRef, { order: currentTab.order });
  }

  /** ✅ Move Tab Down */
  async moveTabRight(index: number, tabs: Tab[]) {
    if (index === tabs.length - 1) return; // Already last tab, can't move down

    const currentTab = tabs[index];
    const nextTab = tabs[index + 1];

    const currentTabRef = doc(this.firestore, `tabs/${currentTab.id}`);
    const nextTabRef = doc(this.firestore, `tabs/${nextTab.id}`);

    // Swap orders
    await updateDoc(currentTabRef, { order: nextTab.order });
    await updateDoc(nextTabRef, { order: currentTab.order });
  }

  /** ✅ Delete Tab (Require "DELETE" Confirmation) */
  async deleteTab(tabId: string) {
    const confirmation = prompt('Type "DELETE" to confirm tab deletion:');
    if (confirmation !== 'DELETE') return;

    await deleteDoc(doc(this.firestore, `tabs/${tabId}`));

    if (this.activeTabId === tabId) {
      this.activeTabId = null;
    }
  }

  /** ✅ Switch Tab */
  switchTab(tabId: string) {
    this.activeTabId = tabId;
    console.log(`🔄 Switching to tab: ${tabId}`);
  }
}