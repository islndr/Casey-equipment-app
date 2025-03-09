import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
import { Firestore, collection, collectionData, doc, getDoc, setDoc, deleteDoc, updateDoc, query, orderBy } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { SpecSheetTableComponent } from '../spec-sheet-table/spec-sheet-table.component';
import { Observable } from 'rxjs';
interface Tab {
  id: string;
  name: string;
  columns: string[];
  rows: any[];
  order: number;
}


@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css'],
  imports: [
    FormsModule,
    CommonModule,
    NgForOf,
    SpecSheetTableComponent,
  ],
})
export class TabsComponent implements OnInit {
  tabs: Tab[] = [];
  selectedTab: Tab | null = null;
  newColumnName: string = '';
  tabs$: Observable<Tab[]>;
  tabsArr: Tab[] = [];
  activeTabId: string | null = null;
  currentColumns: string[] = []; // Add this property
  currentRows: any[] = [];

  
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
    if (confirmation !== 'delete') return;

    await deleteDoc(doc(this.firestore, `tabs/${tabId}`));

    if (this.activeTabId === tabId) {
      this.activeTabId = null;
    }
  }

  switchTab(tabId: string) {
    this.activeTabId = tabId;
  
    // ✅ Fetch columns and rows specific to the selected tab
    const selectedTab = this.tabsArr.find(tab => tab.id === tabId);
    if (selectedTab) {
      this.currentColumns = [...selectedTab.columns]; // Keep columns unique per tab
      this.currentRows = [...selectedTab.rows]; // Keep rows unique per tab
    }
  }


  


  
/** ✅ Load Tabs and Auto-Select First Tab */
async loadTabs() {
  const tabsRef = collection(this.firestore, 'tabs');
  collectionData(tabsRef, { idField: 'id' }).subscribe((tabs: any[]) => {
    this.tabs = tabs.map(tab => ({
      id: tab.id,
      name: tab.name,
      columns: tab.columns || [],
      rows: tab.rows || [],
      order: tab.order
    }));

    // ✅ Auto-select the first tab if available and no tab is selected
    if (this.tabs.length > 0 && !this.selectedTab) {
      this.selectTab(this.tabs[0]);
    }
  });
}

  

  /** ✅ Select Tab */
  selectTab(tab: Tab) {
    this.selectedTab = tab;
  }

  /** ✅ Add Column */
  async addColumn(tab: Tab) {
    if (!this.newColumnName.trim()) {
      alert('Column name cannot be empty.');
      return;
    }

    if (tab.columns.includes(this.newColumnName)) {
      alert(`Column "${this.newColumnName}" already exists in this tab.`);
      return;
    }

    tab.columns.push(this.newColumnName);
    await updateDoc(doc(this.firestore, `tabs/${tab.id}`), { columns: tab.columns });

    this.newColumnName = ''; // Clear input after adding
  }

  /** ✅ Add Row */
  async addRow(tab: Tab) {
    const newRow: Record<string, any> = tab.columns.reduce((row: Record<string, any>, col: string) => {
      row[col] = ''; // Empty row values
      return row;
    }, {});

    tab.rows.push(newRow);
    await updateDoc(doc(this.firestore, `tabs/${tab.id}`), { rows: tab.rows });
  }

  /** ✅ Add a New Tab */
  async addTab() {
    const tabName = prompt('Enter tab name:');
    if (!tabName) return;

    const newTabId = crypto.randomUUID();
    const newTab: Tab = { id: newTabId, name: tabName, columns: [], rows: [], order: Date.now() }; // Using timestamp for order

    const tabRef = doc(this.firestore, `tabs/${newTab.id}`);
    await setDoc(tabRef, newTab);

    // ✅ Automatically create a spec sheet for this tab
    const newSpecSheet = { id: crypto.randomUUID(), tabId: newTabId };
    const specSheetRef = doc(this.firestore, `specSheets/${newSpecSheet.id}`);
    await setDoc(specSheetRef, newSpecSheet);

    console.log(`✅ Created spec sheet for new tab: ${newTabId}`);
  }

}