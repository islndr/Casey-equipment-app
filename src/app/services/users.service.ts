import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(private firestore: Firestore) {}

  async addUser(userData: any) {
    const usersCollection = collection(this.firestore, 'users');
    await addDoc(usersCollection, userData);
  }

  async getUsers() {
    const usersCollection = collection(this.firestore, 'users');
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map(doc => doc.data());
  }
}