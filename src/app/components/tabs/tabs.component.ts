import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactInfoComponent } from '../contact-info/contact-info.component';
import { TabsService } from '../../services/tabs.service';
import { Observable } from 'rxjs';

interface Tab {
  id?: string;
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
export class TabsComponent implements OnInit {
  tabs: Tab[] = [];
  selectedTab: Tab | null = null;
  showEditMenu = false;

  constructor(private tabsService: TabsService) {}

  ngOnInit() {
    this.tabsService.getTabs().subscribe(data => {
      this.tabs = data;
      if (this.tabs.length) {
        this.selectedTab = this.tabs[0];
      }
    });
  }

  toggleEditMenu() {
    this.showEditMenu = !this.showEditMenu;
  }

  addTab() {
    const newTitle = prompt('Enter new tab title', 'New Tab');
    if (newTitle) {
      const newTab: Tab = { title: newTitle, content: 'New tab content', isContact: false };
      this.tabsService.addTab(newTab).then(() => {
        this.tabs.push(newTab);
        this.selectedTab = newTab;
      });
    }
  }

  editTab(tab: Tab) {
    const newTitle = prompt('Enter new title', tab.title);
    if (newTitle) {
      this.tabsService.updateTab(tab.id!, { title: newTitle }).then(() => {
        tab.title = newTitle;
      });
    }
  }

  deleteTab(tab: Tab) {
    const verification = prompt('Enter 99 to delete this tab');
    if (verification === '99') {
      this.tabsService.deleteTab(tab.id!).then(() => {
        const index = this.tabs.indexOf(tab);
        if (index > -1) {
          this.tabs.splice(index, 1);
          this.selectedTab = this.tabs.length ? this.tabs[0] : null;
        }
      });
    } else {
      alert('Incorrect verification code. Tab not deleted.');
    }
  }

  selectTab(tab: Tab) {
    this.selectedTab = tab;
  }
}