import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Auth, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';

interface User {
  id: string;
  email: string;
  role: string;
}


@Component({
  selector: 'app-admin-panel',
  standalone: true,
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css'],
  imports: [
    FormsModule,
  ],
})
export class AdminPanelComponent implements OnInit {
  users: User[] = [];
  newUserEmail: string = '';
  newUserRole: string = 'user';

  
  auth: Auth;

  constructor(private firestore: Firestore, auth: Auth, private router: Router) {
    this.auth = auth;
  }
  ngOnInit(): void {
    this.loadUsers();
  }

async logout() {
  await signOut(this.auth);
  this.router.navigate(['/login']);

}

  /** ✅ Load Users from Firestore */
  loadUsers() {
    const usersRef = collection(this.firestore, 'users');
    collectionData(usersRef, { idField: 'id' }).subscribe((users: any[]) => {
      this.users = users;
    });
  }

  /** ✅ Add a New User */
  async addUser() {
    if (!this.newUserEmail.trim()) return alert('Please enter an email.');
    
    const newUser: User = { id: crypto.randomUUID(), email: this.newUserEmail, role: this.newUserRole };
    const userRef = doc(this.firestore, `users/${newUser.id}`);

    await setDoc(userRef, newUser);
    this.newUserEmail = '';
    this.newUserRole = 'user';
  }

  /** ✅ Update User Role */
  async updateUserRole(user: User) {
    const userRef = doc(this.firestore, `users/${user.id}`);
    await setDoc(userRef, user);
  }

  /** ✅ Delete User with Confirmation */
  async confirmDeleteUser(user: User) {
    const confirmation = prompt(`Type "delete" to remove ${user.email}`);
    if (confirmation !== 'delete') return;

    const userRef = doc(this.firestore, `users/${user.id}`);
    await deleteDoc(userRef);
  }



}