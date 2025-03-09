import { Injectable } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  User, 
  onAuthStateChanged, 
  sendPasswordResetEmail, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  setPersistence,
  deleteUser,
  getAuth,
  
} from '@angular/fire/auth';
import { Firestore, collection, doc, getDoc, setDoc, updateDoc, collectionData, deleteDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http'; // ✅ Import HttpClient for API call


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: User | null = null;
  userRole: string | null = null;

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {
    this.listenForAuthChanges();
  
    // ✅ Restore session from localStorage or sessionStorage
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      if (this.currentUser) {
        console.log('🔄 Session restored for:', this.currentUser.email);
      }
    }
  }

  

  /** ✅ Listen for Authentication Changes & Sync with Firestore */
  private listenForAuthChanges() {
    onAuthStateChanged(this.auth, async (user) => {
      this.currentUser = user;
      if (user) {
        await this.ensureUserInFirestore(user.uid, user.email);
        await this.loadUserRole(user.uid);
      } else {
        this.userRole = null;
      }
    });
  }

  private async ensureUserInFirestore(uid: string, email: string | null) {
    if (!email) return;
  
    const userRef = doc(this.firestore, `users/${uid}`);
    const userSnap = await getDoc(userRef);
  
    if (!userSnap.exists()) {
      console.log(`🆕 Adding new user: ${email} to Firestore as "editor"`);
      await setDoc(userRef, {
        email,
        role: 'editor', // Default role
        createdAt: new Date(),
        lastLogin: new Date()
      });
    } else {
      // ✅ Update last login timestamp
      await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
    }
  }

  /** ✅ Load User Role from Firestore */
  async loadUserRole(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      this.userRole = userSnap.data()['role'];
    } else {
      console.warn('⚠️ User role not found in Firestore, setting default role to "editor"');
      this.userRole = 'editor';  // Default role if not found
    }
  }

  async login(email: string, password: string, rememberMe: boolean) {
    try {
      // ✅ Set persistence BEFORE sign-in
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(this.auth, persistenceType);
  
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
  
      // ✅ Ensure user exists in Firestore
      await this.ensureUserInFirestore(user.uid, user.email);
  
      // ✅ Store session data for quick access
      const sessionData = { uid: user.uid, email: user.email, role: this.getRole() };
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem('user', JSON.stringify(sessionData));
      }
  
      return userCredential;
    } catch (error) {
      console.error('❌ Login Error:', error);
      throw error;
    }
  }


  




  /** ✅ Logout */
  async logout() {
    try {
      await this.auth.signOut();
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      this.currentUser = null;
      this.userRole = null;
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }

  /** ✅ Allow Admins to Update Roles */
  async updateUserRole(userId: string, newRole: string) {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        await updateDoc(userRef, { role: newRole });
        console.log(`✅ Updated user ${userId} to role ${newRole}`);
      } else {
        console.warn('⚠️ User not found');
      }
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      throw error;
    }
  }

  /** ✅ Load All Users from Firestore */
  async getAllUsers() {
    const usersRef = collection(this.firestore, 'users');
    return firstValueFrom(collectionData(usersRef, { idField: 'id' }));
  }

  /** ✅ Create a New User (Admin-Only) */
  async createUser(email: string, password: string, role: string = "editor") {
    try {
      const adminUser = this.auth.currentUser;
      if (!adminUser) {
        throw new Error("❌ You must be logged in as an admin to create users.");
      }

      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const newUser = userCredential.user;

      const userRef = doc(this.firestore, `users/${newUser.uid}`);
      await setDoc(userRef, {
        email: newUser.email,
        role: role,
        createdAt: new Date(),
        lastLogin: new Date()
      });

      console.log(`✅ Created new user: ${email} with role: ${role}`);
      return newUser;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }

 /** ✅ Delete User from Firestore and Firebase Authentication */
async deleteUser(userId: string) {
  try {
    const adminUser = this.auth.currentUser;
    if (!adminUser) {
      throw new Error("❌ You must be logged in as an admin to delete users.");
    }

    const userRef = doc(this.firestore, `users/${userId}`);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("❌ User not found in Firestore.");
    }

    // ✅ Delete user from Firestore
    await deleteDoc(userRef);
    console.log(`🗑️ Deleted user ${userId} from Firestore.`);

    // ✅ Delete user from Firebase Authentication
    if (adminUser.uid === userId) {
      await adminUser.delete();
      console.log(`🗑️ Deleted user ${userId} from Firebase Authentication.`);
    } else {
      console.warn('⚠️ Cannot delete other users from Firebase Authentication using client SDK.');
    }

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    throw error;
  }
}

  /** ✅ Reset Password */
  resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email)
      .then(() => console.log(`📩 Reset email sent to ${email}`))
      .catch(error => {
        console.error('❌ Error sending reset email:', error);
        throw error;
      });
  }
  /** ✅ Save User to Firestore (Ensures Users Exist in Database) */
async saveUserToFirestore(user: User) {
  if (!user) return;

  const userRef = doc(this.firestore, `users/${user.uid}`);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.log(`🆕 Adding new user: ${user.email} to Firestore as "editor"`);
    await setDoc(userRef, {
      email: user.email,
      role: "editor",  // Default role
      createdAt: new Date(),
      lastLogin: new Date()
    });
  } else {
    await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
  }
}

  /** ✅ Get User Role */
  getRole(): string | null {
    return this.userRole;
  }

  /** ✅ Get Current User */
  getCurrentUser(): User | null {
    return this.currentUser;
  }
}