import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, updateDoc, collectionData } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

interface Contact {
  id?: string;
  type: string;
  value: string;
}

@Component({
  selector: 'app-contact-management',
  standalone: true,
  templateUrl: './contact-management.component.html',
  styleUrls: ['./contact-management.component.css'],
  imports: [FormsModule, CommonModule], // Add any necessary Angular modules or components here
})
export class ContactManagementComponent implements OnInit {
  contacts$: Observable<Contact[]>;
  newContact: Contact = { type: '', value: '' };
  contactTypes = ['Phone', 'Email', 'Fax', 'Address'];

  constructor(private firestore: Firestore) {
    const contactsCollection = collection(this.firestore, 'contacts');
    this.contacts$ = collectionData(contactsCollection, { idField: 'id' }) as Observable<Contact[]>;
  }

  async addContact() {
    if (this.newContact.type && this.newContact.value) {
      const contactsCollection = collection(this.firestore, 'contacts');
      await addDoc(contactsCollection, this.newContact);
      this.newContact = { type: '', value: '' }; // Reset form
    }
  }

  async updateContact(contact: Contact) {
    if (contact.id) {
      const contactDocRef = doc(this.firestore, `contacts/${contact.id}`);
      await updateDoc(contactDocRef, { type: contact.type, value: contact.value });
    }
  }

  async deleteContact(contactId: string) {
    const contactDocRef = doc(this.firestore, `contacts/${contactId}`);
    await deleteDoc(contactDocRef);
  }

  ngOnInit() {}
}