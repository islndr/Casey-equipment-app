import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // ✅ Ensures this service is available everywhere
})
export class TabsService {
  constructor(private firestore: Firestore) {} // ✅ Inject Firestore

  getTabs(): Observable<any[]> {
    const tabsRef = collection(this.firestore, 'tabs');
    return collectionData(tabsRef);
  }

  async addTab(tab: any) {
    const tabRef = doc(this.firestore, `tabs/${tab.id}`);
    await setDoc(tabRef, tab);
  }
}