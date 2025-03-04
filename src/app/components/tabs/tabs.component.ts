import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { SpecSheetTableComponent } from '../spec-sheet-table/spec-sheet-table.component';

interface Tab {
  id: string;
  name: string;
}

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css'],
  imports: [CommonModule, SpecSheetTableComponent]
})
export class TabsComponent implements OnInit {
  tabs$: Observable<Tab[]>;
  activeTabId: string | null = null;

  constructor(private firestore: Firestore) {
    this.tabs$ = collectionData(collection(this.firestore, 'tabs'), { idField: 'id' }) as Observable<Tab[]>;
  }

  ngOnInit(): void {
    this.tabs$.subscribe(tabs => {
    
    });
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.tabs$) {
        this.tabs$.subscribe(tabs => {
          if (tabs.length > 0) {
            this.switchTab(tabs[0].id);
          }
        });
      }
    }, 100);
  }

  async addTab() {
    const tabName = prompt('Enter tab name:');
    if (!tabName) return;
  
    const newTabId = crypto.randomUUID();
    const newTab = { id: newTabId, name: tabName };
    
    const tabRef = doc(this.firestore, `tabs/${newTab.id}`);
    await setDoc(tabRef, newTab);
  
    // ✅ Automatically create a spec sheet for this tab
    const newSpecSheet = { id: crypto.randomUUID(), tabId: newTabId };
    const specSheetRef = doc(this.firestore, `specSheets/${newSpecSheet.id}`);
    await setDoc(specSheetRef, newSpecSheet);
  
    console.log(`✅ Created spec sheet for new tab: ${newTabId}`);
  }



  switchTab(tabId: string) {
    this.activeTabId = tabId;
    console.log(`🔄 Switching to tab: ${tabId}`);
  }




  async editTab(tab: Tab) {
    const newName = prompt('Enter new tab name:', tab.name);
    if (!newName || newName.trim() === '') return;
  
    const tabRef = doc(this.firestore, `tabs/${tab.id}`);
    await setDoc(tabRef, { ...tab, name: newName });
  
    console.log(`✅ Tab renamed: ${newName}`);
  }
  
  async deleteTab(tabId: string) {
    const confirmation = prompt('Type "delete" to confirm tab deletion:');
    if (confirmation !== 'delete') {
      alert('Tab deletion cancelled.');
      return;
    }
  
    await deleteDoc(doc(this.firestore, `tabs/${tabId}`));
    console.log(`❌ Tab deleted: ${tabId}`);
  
    if (this.activeTabId === tabId) {
      this.activeTabId = null;
    }
  }
  
  moveTabUp(index: number) {
    this.reorderTabs(index, index - 1);
  }
  
  moveTabDown(index: number) {
    this.reorderTabs(index, index + 1);
  }
  
  reorderTabs(fromIndex: number, toIndex: number) {
    this.tabs$.subscribe(tabs => {
      const updatedTabs = [...tabs];
      const temp = updatedTabs[fromIndex];
      updatedTabs[fromIndex] = updatedTabs[toIndex];
      updatedTabs[toIndex] = temp;
  
      updatedTabs.forEach((tab, i) => {
        const tabRef = doc(this.firestore, `tabs/${tab.id}`);
        setDoc(tabRef, { ...tab, order: i });
      });
  
      console.log('🔄 Tabs reordered.');
    });
  }
}