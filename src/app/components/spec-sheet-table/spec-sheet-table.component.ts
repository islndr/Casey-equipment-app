import { Component, OnInit, HostListener } from '@angular/core';
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
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { MatTableModule } from '@angular/material/table';
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
    MatTableModule // Import MatTableModule

  ]
    
  })
  export class SpecSheetTableComponent implements OnInit {
    displayedColumns: any[] = [];
    combinedColumns: string[] = [];
    dataSource = new MatTableDataSource<any>([]);
    selectedRows: any[] = [];
    editingRowId: string | null = null;
  
    constructor(private firestore: Firestore) {}
  
    ngOnInit(): void {
      this.loadColumns();
      this.loadRows();
    }
  
    /** ✅ Load Columns from Firestore */
    loadColumns() {
      const columnsRef = collection(this.firestore, 'specSheetColumns');
      collectionData(columnsRef).subscribe((columns: any[]) => {
        this.displayedColumns = columns.filter(col => col?.field && col?.headerName);
        if (this.displayedColumns.length === 0) {
          this.displayedColumns = [
            { headerName: 'Title', field: 'title' },
            { headerName: 'Description', field: 'description' }
          ];
        }
        this.updateCombinedColumns();
      });
    }
  
    /** ✅ Load Rows from Firestore */
    loadRows() {
      const rowsRef = collection(this.firestore, 'specSheetRows');
      collectionData(rowsRef, { idField: 'id' }).subscribe((rows: any[]) => {
        this.dataSource.data = rows.map(row => ({ ...row, isEditing: false }));
      });
    }
  
/** ✅ Update Combined Columns (Exclude ID for Display) */
updateCombinedColumns() {
  this.combinedColumns = ['select', ...this.displayedColumns
    .filter(col => col.field !== 'id') // Exclude 'id' from displayed columns
    .map(col => col.field), 'pdfLink',];
}
  
    /** ✅ Add New Row */
    addRow() {
      const newRow = { id: uuidv4(), title: '', description: '', pdfLink: '', isEditing: true };
      this.dataSource.data = [...this.dataSource.data, newRow];
      this.editingRowId = newRow.id;
      this.saveRow(newRow);
    }
  
    /** ✅ Save Row */
    saveRow(row: any) {
      row.isEditing = false;
      const rowRef = doc(this.firestore, `specSheetRows/${row.id}`);
      setDoc(rowRef, row);
    }
  
    /** ✅ Enable Row Editing */
    editRow(row: any) {
      this.editingRowId = row.id;
      row.isEditing = true;
    }
  
    /** ✅ Detect Click Outside the Row to Save */
    @HostListener('document:click', ['$event'])
    onClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.editable-row')) {
        if (this.editingRowId) {
          const row = this.dataSource.data.find(r => r.id === this.editingRowId);
          if (row) this.saveRow(row);
          this.editingRowId = null;
        }
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
  
  
    /** ✅ Add New Column */
    addColumn() {
      const newColumnName = prompt('Enter the new column name:');
      if (!newColumnName || newColumnName.trim() === '') return;
  
      const sanitizedField = newColumnName.toLowerCase().replace(/\s+/g, '_');
      const newCol = { headerName: newColumnName, field: sanitizedField };
  
      if (this.displayedColumns.some(col => col.field === newCol.field)) {
        alert('Column with this name already exists.');
        return;
      }
  
      this.displayedColumns.push(newCol);
      this.updateCombinedColumns();
  
      const columnsRef = collection(this.firestore, 'specSheetColumns');
      setDoc(doc(columnsRef, newCol.field), newCol);
    }
  
    /** ✅ Delete Column */
    deleteColumn(field: string) {
      this.displayedColumns = this.displayedColumns.filter(col => col.field !== field);
      this.updateCombinedColumns();
      const columnsRef = doc(this.firestore, `specSheetColumns/${field}`);
      deleteDoc(columnsRef);
    }
     /** ✅ Edit Column Name */
     editColumnName(column: any) {
      const newHeaderName = prompt('Enter new column name:', column.headerName);
      if (newHeaderName && newHeaderName.trim() !== '') {
        column.headerName = newHeaderName;
        const columnsRef = doc(this.firestore, `specSheetColumns/${column.field}`);
        setDoc(columnsRef, column);
        this.updateCombinedColumns();
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
          const storage = getStorage();
          const storageRef = ref(storage, `pdfs/${file.name}`);
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);
  
          row.pdfLink = downloadURL;
          this.saveRow(row);
        }
      };
  
      input.click();
    }
  }




  