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
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc, query, where, getDocs, getDoc, updateDoc, writeBatch } from '@angular/fire/firestore';import { MatTableModule } from '@angular/material/table';
import { SafePipe } from '../safe.pipe';
import { firstValueFrom } from 'rxjs';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';






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
  sortDirection: { [key: string]: 'asc' | 'desc' | undefined } = {};
   @Input() activeTabId: string | null = null;
   specSheetId: string | null = null;







   constructor(private firestore: Firestore, private auth: Auth) {
    const specSheetsRef = collection(this.firestore, 'specSheets');
 
  
   }
   handleEnterPress = (event: KeyboardEvent, row: any, inputElement: HTMLInputElement) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // ✅ Prevent default form submission
      console.log(`✅ Enter pressed, saving row ${row.id}`);
  
      this.saveRow(row);
      this.editingRowId = null;
      row.isEditing = false;
      inputElement.blur(); // ✅ Unfocus input after saving
    }
  };
  handleBlurSave = (row: any) => {
    console.log(`🔹 Input blurred, saving row ${row.id}`);
    this.saveRow(row);
    this.editingRowId = null;
    row.isEditing = false;
  };
   

   async ngOnInit(): Promise<void> { // Ensure async keyword is here
      await this.loadSpecSheet();
      await this.loadColumns();
      await this.loadRows();
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          console.log("✅ User is authenticated:", user.uid);
          await this.loadSpecSheet();
        } else {
          console.error("❌ User is not authenticated.");
        }
      });
   }

   async ngOnChanges(changes: SimpleChanges) {
    if (changes['activeTabId'] && changes['activeTabId'].currentValue) {
      console.log(`🔄 Reloading spec sheet for tab: ${this.activeTabId}`);
      await this.loadSpecSheet();
    }
   }


  async loadSpecSheet() {
    if (!this.activeTabId) return;
  
    console.log(`📥 Loading spec sheet for tabId: ${this.activeTabId}`);
  
    const specSheetsRef = collection(this.firestore, 'specSheets');
    const specSheetQuery = query(specSheetsRef, where('tabId', '==', this.activeTabId));
  
    try {
      const specSheets: any[] = (await firstValueFrom(collectionData(specSheetQuery, { idField: 'id' }))) ?? [];
  
      if (specSheets.length === 0) {
        console.warn(`⚠️ No spec sheet found for tabId: ${this.activeTabId}, creating one...`);
  
        // Create a new spec sheet if one does not exist
        const newSpecSheet = { id: uuidv4(), tabId: this.activeTabId };
        const specSheetRef = doc(this.firestore, `specSheets/${newSpecSheet.id}`);
        await setDoc(specSheetRef, newSpecSheet);
  
        console.log(`✅ Created new spec sheet with ID: ${newSpecSheet.id}`);
  
        this.specSheetId = newSpecSheet.id;
      } else {
        this.specSheetId = specSheets[0].id;
        console.log(`✅ Found specSheetId: ${this.specSheetId}`);
      }
  
      // Load the columns and rows for the found spec sheet
      await this.loadColumns();
      await this.loadRows();
  
    } catch (error) {
      console.error('❌ Error loading spec sheet:', error);
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
  
        this.specSheetId = newSpecSheet.id;
      } else {
        this.specSheetId = specSheets[0].id;
        console.log(`✅ Found specSheetId: ${this.specSheetId}`);
      }
  
      // Now load columns for this specSheetId
      
      const columnsRef = collection(this.firestore, `specSheets/${this.specSheetId}/columns`);
      collectionData(columnsRef, { idField: 'id' }).subscribe((columns: any[] = []) => {
        console.log(`📊 Loaded columns:`, columns);
        this.displayedColumns = columns.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
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
  
      this.specSheetId = specSheets[0].id;
      console.log(`✅ Found specSheetId: ${this.specSheetId}`);
  
      // Fetch rows for this specSheetId
      
      const rowsRef = collection(this.firestore, `specSheets/${this.specSheetId}/rows`);
      collectionData(rowsRef, { idField: 'id' }).subscribe((rows: any[] = []) => {
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
async addRow() {
  if (!this.activeTabId) {
    console.error("❌ Error: activeTabId is missing.");
    return;
  }

  // Ensure specSheetId is available
  if (!this.specSheetId) {
    console.warn("⚠️ No specSheetId found. Fetching from Firestore...");
    await this.loadSpecSheet();
    if (!this.specSheetId) {
      console.error("❌ Error: specSheetId is still missing after fetching.");
      return;
    }
  }

  console.log(`➕ Adding row to specSheetId: ${this.specSheetId}`);

  const newRow = { id: uuidv4(), specSheetId: this.specSheetId, isEditing: true };
  const rowRef = doc(this.firestore, `specSheets/${this.specSheetId}/rows/${newRow.id}`);

  try {
    await setDoc(rowRef, newRow);
    console.log(`✅ Row added successfully: ${newRow.id}`);
  } catch (error) {
    console.error("❌ Firestore Error Adding Row:", error);
  }
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
  // ✅ Save the currently edited row before switching to a new one
  if (this.editingRowId !== null && this.editingRowId !== row.id) {
    const currentEditingRow = this.dataSource.data.find(r => r.id === this.editingRowId);
    if (currentEditingRow) {
      console.log(`🔄 Saving previous row ${this.editingRowId} before switching.`);
      this.saveRow(currentEditingRow);
    }
  }

  // ✅ Start editing the new row
  this.editingRowId = row.id;
  row.isEditing = true;

  setTimeout(() => {
    const inputElement = document.querySelector(`input[data-row-id="${row.id}"][data-field="${field}"]`) as HTMLInputElement;

    if (inputElement) {
      inputElement.focus();
      console.log(`🔹 Focused on input for row: ${row.id}, field: ${field}`);

      // ✅ Remove previous event listeners to prevent duplicates
      inputElement.removeEventListener('keydown', (event) => this.handleEnterPress(event, row, inputElement));
      inputElement.removeEventListener('blur', () => this.handleBlurSave(row));

      // ✅ Attach Enter key event
      inputElement.addEventListener('keydown', (event) => this.handleEnterPress(event, row, inputElement));

      // ✅ Attach Blur event to save changes when focus is lost
      inputElement.addEventListener('blur', () => this.handleBlurSave(row));
    } else {
      console.error(`❌ Input element not found for row ${row.id}, field ${field}`);
    }
  }, 50); // ✅ Slight delay ensures DOM updates before querying for input
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
  async deleteSelectedRows() {
    if (!this.specSheetId) return;
  
    const batch = writeBatch(this.firestore);
    this.selectedRows.forEach(row => {
      const rowRef = doc(this.firestore, `specSheets/${this.specSheetId}/rows/${row.id}`);
      batch.delete(rowRef);
    });
    await batch.commit();
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
  
    const newColumnName = prompt('Enter new column name:');
  
    if (!newColumnName?.trim()) {
      alert("⚠️ Invalid column name.");
      return;
    }
  
    // ✅ Fetch existing columns
    const specSheetsRef = collection(this.firestore, 'specSheets');
    const specSheetQuery = query(specSheetsRef, where('tabId', '==', this.activeTabId));
    const specSheets = await firstValueFrom(collectionData(specSheetQuery, { idField: 'id' }));
  
    if (specSheets.length === 0) {
      alert("⚠️ No spec sheet found for this tab.");
      return;
    }
  
    this.specSheetId = specSheets[0].id;
  
    const columnsRef = collection(this.firestore, `specSheets/${this.specSheetId}/columns`);
    const existingColumns = await firstValueFrom(collectionData(columnsRef, { idField: 'id' }));
  
    // ✅ Determine new column order (append at the end)
    const newOrder = existingColumns.length > 0 
      ? Math.max(...existingColumns.map(col => col['order'] ?? 0)) + 1 
      : 1;
  
    // ✅ Create a sanitized field name
    const sanitizedField = newColumnName.toLowerCase().replace(/\s+/g, '_');
  
    // ✅ Ensure column does not already exist
    if (existingColumns.some(col => col['field'] === sanitizedField)) {
      alert(`⚠️ Column "${newColumnName}" already exists.`);
      return;
    }
  
    // ✅ Create a new column document in Firestore
    const newCol = {
      id: uuidv4(),
      headerName: newColumnName,
      field: sanitizedField,
      order: newOrder, // ✅ Auto-assigned order number
      createdAt: new Date()
    };
  
    const columnRef = doc(this.firestore, `specSheets/${this.specSheetId}/columns/${newCol.id}`);
    await setDoc(columnRef, newCol);
  
    // ✅ Update UI
    this.displayedColumns.push(newCol);
    this.updateCombinedColumns();
    alert(`✅ Column "${newColumnName}" added successfully!`);
  }

/** ✅ Move Column Left */
async moveColumnLeft(index: number) {
  if (index === 0 || !this.specSheetId) return; // Already first column, can't move left

  const currentColumn = this.displayedColumns[index];
  const previousColumn = this.displayedColumns[index - 1];

  const currentColumnRef = doc(this.firestore, `specSheets/${this.specSheetId}/columns/${currentColumn.id}`);
  const previousColumnRef = doc(this.firestore, `specSheets/${this.specSheetId}/columns/${previousColumn.id}`);

  try {
    // ✅ Swap order values in Firestore
    await updateDoc(currentColumnRef, { order: previousColumn.order });
    await updateDoc(previousColumnRef, { order: currentColumn.order });

    // ✅ Swap in UI array
    [this.displayedColumns[index], this.displayedColumns[index - 1]] = 
      [this.displayedColumns[index - 1], this.displayedColumns[index]];

    console.log(`⬅️ Column moved left:`, this.displayedColumns.map(col => col.headerName));

    // ✅ Re-sort and update UI
    this.refreshColumnOrder();
  } catch (error) {
    console.error("❌ Error moving column left:", error);
  }
}

/** ✅ Move Column Right */
async moveColumnRight(index: number) {
  if (index === this.displayedColumns.length - 1 || !this.specSheetId) return; // Already last column, can't move right

  const currentColumn = this.displayedColumns[index];
  const nextColumn = this.displayedColumns[index + 1];

  const currentColumnRef = doc(this.firestore, `specSheets/${this.specSheetId}/columns/${currentColumn.id}`);
  const nextColumnRef = doc(this.firestore, `specSheets/${this.specSheetId}/columns/${nextColumn.id}`);

  try {
    // ✅ Swap order values in Firestore
    await updateDoc(currentColumnRef, { order: nextColumn.order });
    await updateDoc(nextColumnRef, { order: currentColumn.order });

    // ✅ Swap in UI array
    [this.displayedColumns[index], this.displayedColumns[index + 1]] = 
      [this.displayedColumns[index + 1], this.displayedColumns[index]];

    console.log(`➡️ Column moved right:`, this.displayedColumns.map(col => col.headerName));

    // ✅ Re-sort and update UI
    this.refreshColumnOrder();
  } catch (error) {
    console.error("❌ Error moving column right:", error);
  }
}

/** ✅ Refresh Column Order */
refreshColumnOrder() {
  // ✅ Sort columns by order value
  this.displayedColumns.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // ✅ Update UI
  this.updateCombinedColumns();
}






  async deleteColumn(columnId: string) {
    if (!this.specSheetId) return;
    const column = this.displayedColumns.find(col => col.id === columnId);
    const columnNameUpper = column.headerName.toUpperCase();
    const userInput = prompt(`⚠️ Type 'delete' to confirm deleting column: ${columnNameUpper}`);
    if (userInput?.toLowerCase() !== "delete") {
      console.log("❌ Deletion canceled.");
      return;
    }
  
    try {
      console.log(`🗑️ Deleting column: ${columnId}`);
  
      // ✅ Delete column document from Firestore
      const columnRef = doc(this.firestore, `specSheets/${this.specSheetId}/columns/${columnId}`);
      await deleteDoc(columnRef);
      console.log(`✅ Column ${columnId} deleted from Firestore.`);
  
      // ✅ Remove column field from all rows
      await this.removeColumnFromRows(columnId);
  
      // ✅ Update UI
      this.displayedColumns = this.displayedColumns.filter(col => col.id !== columnId);
      this.updateCombinedColumns();
      console.log(`✅ Column ${columnId} removed from UI.`);
      
    } catch (error) {
      console.error("❌ Error deleting column:", error);
    }
  }
  async removeColumnFromRows(columnId: string) {
    if (!this.specSheetId) return;
  
    console.log(`🔄 Removing field "${columnId}" from all rows...`);
  
    const rowsRef = collection(this.firestore, `specSheets/${this.specSheetId}/rows`);
    const rowsSnapshot = await getDocs(rowsRef);
    const batch = writeBatch(this.firestore);
  
    rowsSnapshot.forEach((docSnap) => {
      const rowData = docSnap.data();
  
      if (rowData[columnId] !== undefined) {
        const updatedRowData = { ...rowData };
        delete updatedRowData[columnId]; // Remove the column field
        batch.update(docSnap.ref, updatedRowData);
      }
    });
  
    try {
      await batch.commit();
      console.log(`✅ Field "${columnId}" removed from all rows.`);
      
      // ✅ Update UI
      this.dataSource.data = this.dataSource.data.map(row => {
        if (row[columnId] !== undefined) {
          delete row[columnId];
        }
        return row;
      });
  
    } catch (error) {
      console.error("❌ Error updating rows:", error);
    }
  }

  /** ✅ Edit Column Name and Order */
  async editColumnName(column: any) {
    const newHeaderName = prompt('Enter new column name:', column.headerName);
  
    if (!newHeaderName?.trim()) return;
  
    // ✅ Generate a new field name from the updated column name
    const newFieldName = newHeaderName.toLowerCase().replace(/\s+/g, '_');
  
    // ✅ Prevent overwriting an existing column field
    if (this.displayedColumns.some(col => col.field === newFieldName)) {
      alert(`⚠️ A column with the name "${newHeaderName}" already exists.`);
      return;
    }
  
    const columnRef = doc(this.firestore, `specSheets/${this.specSheetId}/columns/${column.id}`);
  
    try {
      // ✅ Update the column name in Firestore
      await updateDoc(columnRef, {
        headerName: newHeaderName,
        field: newFieldName
      });
      this.sortColumn = (field: string) => {
        // Toggle between ascending, descending, and default (no sorting)
        if (this.sortDirection[field] === 'asc') {
          this.sortDirection[field] = 'desc';
        } else if (this.sortDirection[field] === 'desc') {
          this.sortDirection[field] = undefined;
        } else {
          this.sortDirection[field] = 'asc';
        }
      
        // Sort the data
        this.dataSource.data.sort((a, b) => {
          const aValue = this.parseValue(a[field]);
          const bValue = this.parseValue(b[field]);
      
          if (this.sortDirection[field] === 'asc') {
            return (aValue as number) - (bValue as number);
          } else if (this.sortDirection[field] === 'desc') {
            return (bValue as number) - (aValue as number);
          } else {
            return 0; // No sorting
          }
        });
      
        // Refresh the UI
        this.dataSource._updateChangeSubscription();
      }
  
      console.log(`✅ Column updated: ${column.id}`);
  
      // ✅ Update UI
      column.headerName = newHeaderName;
      column.field = newFieldName;
      this.updateCombinedColumns();
  
    } catch (error) {
      console.error("❌ Error updating column:", error);
    }
  }


  async updateRowsForRenamedColumn(oldField: string, newField: string) {
    if (!this.specSheetId) return;
  
    console.log(`🔄 Renaming field "${oldField}" to "${newField}" in all rows...`);
  
    const rowsRef = collection(this.firestore, `specSheets/${this.specSheetId}/rows`);
    const rowsSnapshot = await getDocs(rowsRef);
  
    const batch = writeBatch(this.firestore);
    
    rowsSnapshot.forEach((docSnap) => {
      const rowData = docSnap.data();
      
      // Ensure the old field exists in row data
      if (rowData[oldField] !== undefined) {
        rowData[newField] = rowData[oldField]; // Copy data to the new field
        delete rowData[oldField]; // Remove the old field
        batch.update(docSnap.ref, rowData);
      }
    });
  
    try {
      await batch.commit();
      console.log(`✅ Updated field "${oldField}" to "${newField}" in all rows.`);
      
      // Update UI
      this.dataSource.data = this.dataSource.data.map(row => {
        if (row[oldField] !== undefined) {
          row[newField] = row[oldField];
          delete row[oldField];
        }
        return row;
      });
  
    } catch (error) {
      console.error("❌ Error updating rows:", error);
    }
  }


  sortColumn(field: string) {
    // Reset sorting for other columns
    Object.keys(this.sortDirection).forEach(key => {
      if (key !== field) {
        this.sortDirection[key] = undefined; // Reset to default state
      }
    });
  
    // Toggle sorting direction for the selected column
    if (!this.sortDirection[field] || this.sortDirection[field] === 'desc') {
      this.sortDirection[field] = 'asc';
    } else {
      this.sortDirection[field] = 'desc';
    }
  
    console.log(`🔄 Sorting rows by: ${field}, Direction: ${this.sortDirection[field]}`);
  
    this.dataSource.data.sort((a, b) => {
      const aValue = this.parseValue(a[field]);
      const bValue = this.parseValue(b[field]);
  
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return this.sortDirection[field] === 'asc' ? aValue - bValue : bValue - aValue;
      }
  
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection[field] === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
  
      return 0;
    });
  
    // ✅ Refresh UI
    this.dataSource._updateChangeSubscription();
  }
  
  parseValue(value: string | number): number | string {
    if (typeof value === 'number') return value; // If it's a number, return as is
    if (typeof value === 'string') {
      value = value.trim();
  
      // Check if it's a fraction (e.g., "1/3", "3 1/2")
      if (value.includes('/')) {
        return this.parseFraction(value);
      }
  
      // Check if it's a number (including decimals)
      const numberValue = parseFloat(value);
      if (!isNaN(numberValue)) {
        return numberValue;
      }
  
      // Default: return the string itself for alphabetical sorting
      return value.toLowerCase();
    }
    return value;
  }

  parseFraction(value: string): number {
    if (!value) return 0;
  
    value = value.trim();
  
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

/** ✅ Save Row */
async saveRow(row: any) {
  if (!this.specSheetId) return;

  const rowRef = doc(this.firestore, `specSheets/${this.specSheetId}/rows/${row.id}`);
  try {
    await setDoc(rowRef, row, { merge: true }); // ✅ Create if missing, update if exists
    console.log(`✅ Row ${row.id} saved successfully.`);
  } catch (error) {
    console.error(`❌ Error saving row ${row.id}:`, error);
  }
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