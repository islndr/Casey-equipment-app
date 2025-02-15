import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactInfoComponent } from '../contact-info/contact-info.component';

interface Tab {
  title: string;
  content: string;
  isContact: boolean;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, ContactInfoComponent],
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent {
  tabs: Tab[] = [
    { title: 'Spec Sheets', content: 'Spec sheet content goes here', isContact: false },
    { title: 'Contact Info', content: 'Contact info content goes here', isContact: true }
  ];

  selectedTab: Tab | null = null;
  showEditMenu = false;

  toggleEditMenu() {
    this.showEditMenu = !this.showEditMenu;
  }

  addTab() {
    const newTitle = prompt('Enter new tab title', 'New Tab');
    if (newTitle) {
      const newTab: Tab = { title: newTitle, content: 'New tab content', isContact: false };
      this.tabs.splice(this.tabs.length - 1, 0, newTab); // Insert before the last tab (Contact tab)
      this.selectedTab = newTab;
    }
  }

  editTab(tab: Tab) {
    const newTitle = prompt('Enter new title', tab.title);
    if (newTitle) {
      tab.title = newTitle;
    }
  }

  deleteTab(tab: Tab) {
    const verification = prompt('Enter 99 to delete this tab');
    if (verification === '99') {
      const index = this.tabs.indexOf(tab);
      if (index > -1) {
        this.tabs.splice(index, 1);
        this.selectedTab = this.tabs.length ? this.tabs[0] : null;
      }
    } else {
      alert('Incorrect verification code. Tab not deleted.');
    }
  }

  selectTab(tab: Tab) {
    this.selectedTab = tab;
  }
}