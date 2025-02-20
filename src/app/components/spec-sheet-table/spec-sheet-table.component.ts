import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecService } from '../../services/spec.service';
import { Spec } from '../../models/spec.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-spec-sheet-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './spec-sheet-table.component.html',
  styleUrls: ['./spec-sheet-table.component.css']
})
export class SpecSheetTableComponent implements OnInit {
  @Input() tabId: string | null = null;
  specs: Spec[] = [];
  columns: string[] = ['column1', 'column2', 'column3']; // Define the columns property
  showEditTable: boolean = false; // Add a property to toggle edit mode
  tabs: any[] = []; // Define the tabs property
  selectedTab: number = 0; // Add a property to track the selected tab

  constructor(private specService: SpecService) {}

  ngOnInit() {
    if (this.tabId) {
      this.specService.getSpecs(this.tabId).subscribe(data => {
        this.specs = data;
      });
    }
    // Initialize tabs (example data, replace with actual data)
    this.tabs = [
      { title: 'Tab 1', id: 'tab1' },
      { title: 'Tab 2', id: 'tab2' },
      { title: 'Tab 3', id: 'tab3' }
    ];
  }

  toggleEditTable() {
    this.showEditTable = !this.showEditTable;
  }

  addSpec() {
    const newSpec: Spec = { column1: '', column2: '', column3: '' };
    this.columns.forEach(column => {
      if (!newSpec[column]) {
        newSpec[column] = '';
      }
    });
    this.specService.addSpec(this.tabId!, newSpec).then(() => {
      this.specs.push(newSpec);
    });
  }

  editSpec(spec: Spec, column: string, value: string) {
    spec[column] = value;
    this.specService.updateSpec(this.tabId!, spec.id!, { [column]: value });
  }

  deleteSpec(spec: Spec) {
    const specIndex = this.specs.indexOf(spec);
    if (specIndex > -1) {
      this.specs.splice(specIndex, 1);
      this.specService.deleteSpec(this.tabId!, spec.id!);
    }
  }

  addColumn() {
    const newColumnName = prompt('Enter new column name');
    if (newColumnName) {
      const newColumn = newColumnName;
      this.columns.push(newColumn);
      this.specs.forEach(spec => {
        spec[newColumn] = '';
      });
    }
  }

  editColumn(column: string) {
    const newColumnName = prompt('Enter new column name', column);
    if (newColumnName) {
      const columnIndex = this.columns.indexOf(column);
      if (columnIndex > -1) {
        this.columns[columnIndex] = newColumnName;
        this.specs.forEach(spec => {
          spec[newColumnName] = spec[column];
          delete spec[column];
        });
      }
    }
  }

  deleteColumn(column: string) {
    const columnIndex = this.columns.indexOf(column);
    if (columnIndex > -1) {
      this.columns.splice(columnIndex, 1);
      this.specs.forEach(spec => {
        delete spec[column];
      });
    }
  }

  selectTab(index: number) {
    this.selectedTab = index;
  }
}