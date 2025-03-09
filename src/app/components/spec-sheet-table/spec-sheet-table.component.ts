import { Component, OnInit, OnChanges, SimpleChanges, inject, HostListener, Input } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc, query, where, } from '@angular/fire/firestore';
import { MatTableModule } from '@angular/material/table';
import { SafePipe } from '../safe.pipe';
import { firstValueFrom } from 'rxjs';



@Component({
  selector: 'app-spec-sheet-table',
  standalone: true,
  templateUrl: './spec-sheet-table.component.html',
  styleUrls: ['./spec-sheet-table.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    SafePipe,
   
  ]
})
export class SpecSheetTableComponent implements OnInit, OnChanges {

  displayedColumns: any[] = [];
  combinedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>([]);
  selectedRows: any[] = [];
  editingRowId: string | null = null;
  pdfModalOpen: boolean = false;
  selectedPDFRow: any = null;
  sortDirection: { [key: string]: 'asc' | 'desc' } = {};
   @Input() activeTabId: string | null = null;

   constructor(private firestore: Firestore) {
    const specSheetsRef = collection(this.firestore, 'specSheets');}


  ngOnInit(): void {

      this.loadColumns();
      this.loadRows();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeTabId'] && changes['activeTabId'].currentValue) {
      console.log(`🔄 Reloading spec sheet for tab: ${this.activeTabId}`);
  

   
        this.loadColumns();
        this.loadRows();
      
    }
  }





  async loadColumns() {
    if (!this.activeTabId) return;
  
    console.log(`📥 Fetching columns for tabId: ${this.activeTabId}`);
  
    const specSheetsRef = collection(this.firestore, 'specSheets');
    const specSheetQuery = query(specSheetsRef, where('tabId', '==', this.activeTabId));
  
    try {
      const specSheets: any[] = (await firstValueFrom(collectionData(specSheetQuery, { idField: 'id' }))) ?? [];
  
      if (specSheets.length === 0) {
        console.warn(`⚠️ No spec sheets found for tabId: ${this.activeTabId}, creating one...`);
        
        const newSpecSheet = { id: uuidv4(), tabId: this.activeTabId };
        const specSheetRef = doc(this.firestore, `specSheets/${newSpecSheet.id}`);
        await setDoc(specSheetRef, newSpecSheet);
  
        console.log(`✅ Created new spec sheet with ID: ${newSpecSheet.id}`);
        
        // 🔄 Reload columns after creating the spec sheet
        this.loadColumns();
        return;
      }
  
      const specSheetId = specSheets[0].id;
      console.log(`✅ Found specSheetId: ${specSheetId}`);
  
      const columnsRef = collection(this.firestore, 'specSheetColumns');
      const columnsQuery = query(columnsRef, where('specSheetId', '==', specSheetId));
  
      collectionData(columnsQuery, { idField: 'id' }).subscribe((columns: any[] = []) => {
        console.log(`📊 Loaded columns:`, columns);
        this.displayedColumns = columns.filter(col => col?.field && col?.headerName);
        this.displayedColumns.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        this.updateCombinedColumns();
      });
  
    } catch (error) {
      console.error('❌ Error loading columns:', error);
    }
  }

  async loadRows() {
    if (!this.activeTabId) {
      console.warn('❌ No activeTabId, skipping loadRows');
      return;
    }
  
    console.log(`📥 Fetching rows for tabId: ${this.activeTabId}`);
  
    const specSheetsRef = collection(this.firestore, 'specSheets');
    const specSheetQuery = query(specSheetsRef, where('tabId', '==', this.activeTabId));
  
    try {
      const specSheets: any[] = (await firstValueFrom(collectionData(specSheetQuery, { idField: 'id' }))) ?? [];
  
      if (specSheets.length === 0) {
        console.warn(`⚠️ No spec sheets found for tabId: ${this.activeTabId}`);
        return;
      }
  
      const specSheetId = specSheets[0].id;
      console.log(`✅ Found specSheetId: ${specSheetId}`);
  
      const rowsRef = collection(this.firestore, 'specSheetRows');
      const rowsQuery = query(rowsRef, where('specSheetId', '==', specSheetId));
  
      collectionData(rowsQuery, { idField: 'id' }).subscribe((rows: any[] = []) => {
        console.log(`📋 Loaded rows:`, rows);
        this.dataSource.data = rows.map(row => ({ ...row, isEditing: false }));
      });
  
    } catch (error) {
      console.error('❌ Error loading rows:', error);
    }
  }
/** ✅ Update Combined Columns (Exclude ID for Display) */
updateCombinedColumns() {
  this.combinedColumns = ['select', ...this.displayedColumns
    .filter(col => col.field !== 'id')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(col => col.field), 'pdfLink'];
}







/** ✅ Add New Row for Active Tab */
addRow() {
  if (!this.activeTabId) return;

  const specSheetsRef = collection(this.firestore, 'specSheets');
  const specSheetQuery = query(specSheetsRef, where('tabId', '==', this.activeTabId));

  collectionData(specSheetQuery, { idField: 'id' }).subscribe((specSheets: any[]) => {
    if (specSheets.length === 0) return;

    const specSheetId = specSheets[0].id;
    const newRow = { id: uuidv4(), specSheetId, title: '', description: '', pdfLink: '', isEditing: true };

    this.dataSource.data = [...this.dataSource.data, newRow];
    this.editingRowId = newRow.id;

    const rowRef = doc(this.firestore, `specSheetRows/${newRow.id}`);
    setDoc(rowRef, newRow).then(() => this.applyCurrentSort());
  });
}


/** ✅ Reapply Current Sort */
applyCurrentSort() {
  const activeSortField = Object.keys(this.sortDirection).find(
    field => this.sortDirection[field] !== undefined
  );

  if (activeSortField) {
    this.sortColumn(activeSortField); // Trigger sort based on active sort field
  }
}

/** ✅ Enable Row Editing and Save on Enter */
editRow(row: any, field: string) {
  this.editingRowId = row.id;
  row.isEditing = true;

  setTimeout(() => {
    const inputElement = document.querySelector(`input[data-row-id="${row.id}"][data-field="${field}"]`) as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
      inputElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          this.saveRow(row); // Save row when Enter is pressed
          this.editingRowId = null;
        }
      });
    }
  }, 0);
}

/** ✅ Save Row and Reapply Sorting */
saveRow(row: any) {
  if (!this.activeTabId) return;
  row.isEditing = false;
  const rowRef = doc(this.firestore, `specSheetRows/${row.id}`);
  setDoc(rowRef, row).then(() => {
    this.applyCurrentSort(); // Apply current sort after saving
  });
}





  /** ✅ Save Row When Clicking Outside */
@HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.editable-row') && this.editingRowId) {
    const row = this.dataSource.data.find(r => r.id === this.editingRowId);
    if (row) this.saveRow(row);
    this.editingRowId = null;
  }
}



  /** ✅ Delete Selected Rows */
  deleteSelectedRows() {
    this.selectedRows.forEach(row => {
      const rowRef = doc(this.firestore, `specSheetRows/${row.id}`);
      deleteDoc(rowRef);
    });
    this.dataSource.data = this.dataSource.data.filter(row => !this.selectedRows.includes(row));
    this.selectedRows = [];
  }

  /** ✅ Toggle Row Selection */
  toggleRowSelection(row: any) {
    if (row.selected) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows = this.selectedRows.filter(r => r.id !== row.id);
    }
  }

  /** ✅ Toggle Select All */
  toggleSelectAll(event: any) {
    const isChecked = event.checked;
    this.dataSource.data.forEach(row => (row.selected = isChecked));
    this.selectedRows = isChecked ? [...this.dataSource.data] : [];
  }

  async addColumn() {
    if (!this.activeTabId) return;
  
    const newColumnName = prompt('Enter the new column name:');
    const columnOrder = Number(prompt('Enter the column order (lowest = left, highest = right):'));
  
    if (!newColumnName?.trim() || isNaN(columnOrder)) {
      alert('⚠️ Invalid column name or order.');
      return;
    }
  
    try {
      // ✅ Fetch spec sheet for the active tab
      const specSheetsRef = collection(this.firestore, 'specSheets');
      const specSheetQuery = query(specSheetsRef, where('tabId', '==', this.activeTabId));
      const specSheets = await firstValueFrom(collectionData(specSheetQuery, { idField: 'id' }));
  
      if (specSheets.length === 0) {
        alert('⚠️ No spec sheet found for this tab.');
        return;
      }
  
      const specSheetId = specSheets[0].id;
  
      // ✅ Create a sanitized field name
      const sanitizedField = newColumnName.toLowerCase().replace(/\s+/g, '_');
  
      // ✅ Check if the column already exists in this tab
      const columnsRef = collection(this.firestore, 'specSheetColumns');
      const columnsQuery = query(columnsRef, where('specSheetId', '==', specSheetId), where('field', '==', sanitizedField));
      const existingColumns = await firstValueFrom(collectionData(columnsQuery));
  
      if (existingColumns.length > 0) {
        alert(`⚠️ Column "${newColumnName}" already exists in this tab.`);
        return;
      }
  
      // ✅ Add the new column
      const newCol = {
        id: uuidv4(),
        specSheetId: specSheetId,
        headerName: newColumnName,
        field: sanitizedField,
        order: columnOrder,
        createdAt: new Date()
      };
  
      await setDoc(doc(columnsRef, newCol.id), newCol);
      alert(`✅ Column "${newColumnName}" added successfully!`);
  
      // ✅ Update UI
      this.displayedColumns.push(newCol);
      this.updateCombinedColumns();
    } catch (error) {
      console.error('❌ Error adding column:', error);
      alert('❌ Failed to add column. Please try again.');
    }
  }



  /** ✅ Delete Column */
  deleteColumn(field: string) {
    this.displayedColumns = this.displayedColumns.filter(col => col.field !== field);
    this.updateCombinedColumns();
    const columnsRef = doc(this.firestore, `specSheetColumns/${field}`);
    deleteDoc(columnsRef);
  }

  /** ✅ Edit Column Name and Order */
  editColumnName(column: any) {
    const newHeaderName = prompt('Enter new column name:', column.headerName);
    const newOrder = Number(prompt('Enter new column order:', column.order));

    if (newHeaderName && newHeaderName.trim() !== '') {
      column.headerName = newHeaderName;
    }

    if (!isNaN(newOrder)) {
      column.order = newOrder;
    }

    const columnsRef = doc(this.firestore, `specSheetColumns/${column.field}`);
    setDoc(columnsRef, column);
    this.updateCombinedColumns();
  }

  sortColumn(field: string, direction?: 'asc' | 'desc') {
    const currentDirection = direction || this.sortDirection[field] || 'asc';
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
  
    this.sortDirection = {}; // Clear previous sort states
    this.sortDirection[field] = newDirection;
  
    this.dataSource.data.sort((a, b) => {
      const aValue = this.parseValue(a[field]);
      const bValue = this.parseValue(b[field]);
  
      return newDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  
    this.dataSource._updateChangeSubscription();
  }
/** ✅ Parse value to handle numbers, decimals, and fractions */
parseValue(value: string | number): number {
  if (typeof value === 'number') return value; // Directly return if it's already a number
  if (typeof value === 'string') return this.parseFraction(value.trim()); // Trim and parse fraction
  return 0;
}

/** ✅ Convert Fractions & Mixed Numbers to Decimal */
parseFraction(value: string): number {
  if (!value) return 0;

  // Remove extra spaces
  value = value.trim();

  // Handle whole numbers and decimals
  if (!value.includes('/')) return parseFloat(value) || 0;

  // Handle mixed fractions (e.g., "3 3/4")
  const mixedFractionMatch = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedFractionMatch) {
    const whole = parseInt(mixedFractionMatch[1], 10);
    const numerator = parseInt(mixedFractionMatch[2], 10);
    const denominator = parseInt(mixedFractionMatch[3], 10);
    return whole + numerator / denominator;
  }

  // Handle simple fractions (e.g., "1/4")
  const fractionMatch = value.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1], 10);
    const denominator = parseInt(fractionMatch[2], 10);
    return numerator / denominator;
  }

  return parseFloat(value) || 0; // If not a fraction, try parsing as a decimal
}

  /** ✅ Upload PDF */
  async uploadPDF(row: any) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';

    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const sanitizedFileName = file.name.replace(/\s+/g, '_');
        const storage = getStorage();
        const storageRef = ref(storage, `pdfs/${sanitizedFileName}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        row.pdfLink = downloadURL;
        this.saveRow(row);
      }
    };

    input.click();
  }





  
  /** ✅ View PDF in Modal */
  viewPDF(row: any) {
    this.selectedPDFRow = row;
    this.pdfModalOpen = true;
  }

  /** ✅ Replace PDF */
  async replacePDF() {
    if (!this.selectedPDFRow) return;
    this.uploadPDF(this.selectedPDFRow);
  }

  /** ✅ Delete PDF */
  async deletePDF() {
    if (!this.selectedPDFRow) return;

    const storage = getStorage();
    const filePath = decodeURIComponent(
      this.selectedPDFRow.pdfLink.split('/o/')[1].split('?')[0]
    );
    const fileRef = ref(storage, filePath);

    try {
      await deleteObject(fileRef);
      this.selectedPDFRow.pdfLink = '';
      this.saveRow(this.selectedPDFRow);
      this.pdfModalOpen = false;
    } catch (error) {
      console.error('Error deleting PDF:', error);
    }
  }

  /** ✅ Close PDF Modal */
  closePDFModal() {
    this.pdfModalOpen = false;
    this.selectedPDFRow = null;
  }
  
}