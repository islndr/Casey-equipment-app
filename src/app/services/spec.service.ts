import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, addDoc, deleteDoc, doc, updateDoc, CollectionReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Spec } from '../models/spec.model';

@Injectable({
  providedIn: 'root'
})
export class SpecService {
  constructor(private firestore: Firestore) {}

  getSpecs(tabId: string): Observable<Spec[]> {
    const specsCollection = collection(this.firestore, `tabs/${tabId}/specs`);
    return collectionData(specsCollection, { idField: 'id' }) as Observable<Spec[]>;
  }

  addSpec(tabId: string, spec: Spec): Promise<void> {
    const specsCollection = collection(this.firestore, `tabs/${tabId}/specs`);
    return addDoc(specsCollection, spec).then(() => {});
  }

  updateSpec(tabId: string, specId: string, spec: Partial<Spec>): Promise<void> {
    const specDoc = doc(this.firestore, `tabs/${tabId}/specs/${specId}`);
    return updateDoc(specDoc, spec);
  }

  deleteSpec(tabId: string, specId: string): Promise<void> {
    const specDoc = doc(this.firestore, `tabs/${tabId}/specs/${specId}`);
    return deleteDoc(specDoc);
  }
}