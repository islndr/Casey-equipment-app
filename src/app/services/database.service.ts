import { Injectable, inject, NgZone } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private firestore = inject(Firestore);
  private ngZone = inject(NgZone);

  constructor() {}

  /**
   * 📝 Fetch all spec sheets
   */
  getSpecSheets(): Observable<any[]> {
    const specSheetRef = collection(this.firestore, 'specsheets'); // Ensure 'specsheets' exists
    return new Observable(observer => {
      this.ngZone.run(() => {
        collectionData(specSheetRef, { idField: 'id' }).subscribe(data => {
          observer.next(data);
          observer.complete();
        });
      });
    });
  }

  /**
   * ➕ Add a new spec sheet
   */
  async addSpecSheet(specSheet: any): Promise<void> {
    const specSheetCollection = collection(this.firestore, 'specsheets');
    await this.ngZone.run(() => addDoc(specSheetCollection, specSheet));
  }

  /**
   * 🗑️ Delete a spec sheet
   */
  async deleteSpecSheet(id: string): Promise<void> {
    const specSheetDoc = doc(this.firestore, 'specsheets', id);
    await this.ngZone.run(() => deleteDoc(specSheetDoc));
  }

  /**
   * ✏️ Update an existing spec sheet
   */
  async updateSpecSheet(id: string, updatedData: any): Promise<void> {
    const specSheetDoc = doc(this.firestore, 'specsheets', id);
    await this.ngZone.run(() => updateDoc(specSheetDoc, updatedData));
  }
}