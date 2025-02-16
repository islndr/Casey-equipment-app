import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, addDoc, deleteDoc, doc, updateDoc, CollectionReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface Tab {
  id?: string;
  title: string;
  content: string;
  isContact: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TabsService {
  private tabsCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.tabsCollection = collection(this.firestore, 'tabs');
  }

  getTabs(): Observable<Tab[]> {
    return collectionData(this.tabsCollection, { idField: 'id' }) as Observable<Tab[]>;
  }

  addTab(tab: Tab): Promise<void> {
    return addDoc(this.tabsCollection, tab).then(() => {});
  }

  updateTab(id: string, tab: Partial<Tab>): Promise<void> {
    const tabDoc = doc(this.firestore, `tabs/${id}`);
    return updateDoc(tabDoc, tab);
  }

  deleteTab(id: string): Promise<void> {
    const tabDoc = doc(this.firestore, `tabs/${id}`);
    return deleteDoc(tabDoc);
  }
}

