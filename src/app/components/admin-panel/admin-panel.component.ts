import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Auth, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

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
    CommonModule,
    NgForOf,
   
    
  ],
  providers: [
    AuthService,
  ],
})

  
export class AdminPanelComponent implements OnInit {
  users: User[] = [];
  newUserEmail: string = '';
  newUserRole: string = 'editor';
  newUserPassword: string = ''; 
  private usersSubscription!: Subscription;

  constructor(private firestore: Firestore, private auth: Auth, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }
   /** ✅ Load Users from Firestore */
   async loadUsers() {
   
    const usersRef = collection(this.firestore, 'users');
    collectionData(usersRef, { idField: 'id' }).subscribe(async (users: any[]) => {
      this.users = users;
      try {
        this.users = (await this.authService.getAllUsers()).map(user => ({
          id: user.id,
          email: user['email'],
          role: user['role']
        }));
      } catch (error) {
        console.error("❌ Error loading users:", error);
      }
    });
  }


  async addUser() {
    if (!this.newUserEmail.trim() || !this.newUserPassword.trim()) {
      alert('❌ Please enter an email and password.');
      return;
    }
  
    try {
      await this.authService.createUser(this.newUserEmail, this.newUserPassword, this.newUserRole);
      alert(`✅ User ${this.newUserEmail} created successfully.`);
      
      // Clear the form after successful user creation
      this.newUserEmail = '';
      this.newUserPassword = '';
      this.newUserRole = 'viewer';
  
      // Reload the user list
      this.loadUsers();
    } catch (error) {
      alert('❌ Error creating user: ' + (error as any).message);
    }
  }


  ngOnDestroy(): void {
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe(); // ✅ Unsubscribing to avoid memory leaks
    }
  }


async logout() {
  await signOut(this.auth);
  this.router.navigate(['/login']);

}



  /** ✅ Update User Role */
  async updateUserRole(user: User) {
    const userRef = doc(this.firestore, `users/${user.id}`);
    await setDoc(userRef, user);
  }




/** ✅ Delete User */
async removeUser(user: User) {
   const confirmation = prompt(`Type "delete" to remove ${user.email}`);
    if (confirmation !== 'delete') return;
  try {
    await this.authService.deleteUser(user.id);
    this.users = this.users.filter(u => u.id !== user.id); // ✅ Remove from UI
    alert(`✅ Deleted user ${user.email}.`);
  } catch (error) {
    alert('❌ Error deleting user.');
  }

}


}