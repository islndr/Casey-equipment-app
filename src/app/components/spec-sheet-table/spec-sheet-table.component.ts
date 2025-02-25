import { Component, OnInit } from '@angular/core';
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
  displayedColumns: any[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'title', headerName: 'Title' },
    { field: 'description', headerName: 'Description' }
  ];

  rowData: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  combinedColumns: string[] = ['select', ...this.displayedColumns.map(col => col.field), 'pdfLink', 'actions'];
  selectedRows: any[] = [];

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    this.loadRows();
  }

  // ✅ Load Rows from Firestore
  loadRows(): void {
    const rowsRef = collection(this.firestore, 'specSheetRows');
    collectionData(rowsRef, { idField: 'id' }).subscribe((rows: any[]) => {
      this.rowData = rows;
      this.dataSource.data = this.rowData;
    });
  }

  // ✅ Add New Row
  addRow(): void {
    const newRow = { id: Date.now().toString(), title: '', description: '', pdfLink: '', isEditing: true };
    this.rowData.push(newRow);
    this.dataSource.data = [...this.rowData];
  }

  // ✅ Delete Row
  deleteRow(row: any): void {
    this.rowData = this.rowData.filter(r => r.id !== row.id);
    this.dataSource.data = [...this.rowData];
    const rowRef = doc(this.firestore, `specSheetRows/${row.id}`);
    deleteDoc(rowRef);
  }

  // ✅ Edit Row
  editRow(row: any): void {
    row.isEditing = true;
  }

  // ✅ Save Row After Editing
  saveRow(row: any): void {
    row.isEditing = false;
    const rowRef = doc(this.firestore, `specSheetRows/${row.id}`);
    setDoc(rowRef, row);
  }

  // ✅ Select/Deselect All Rows
  toggleSelectAll(event: any): void {
    const isChecked = event.checked;
    this.rowData.forEach(row => row.selected = isChecked);
    this.selectedRows = isChecked ? [...this.rowData] : [];
  }

  // ✅ Select/Deselect Individual Row
  toggleRowSelection(row: any): void {
    if (row.selected) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows = this.selectedRows.filter(r => r.id !== row.id);
    }
  }

  // ✅ Delete Selected Rows
  deleteSelectedRows(): void {
    this.selectedRows.forEach(row => this.deleteRow(row));
    this.selectedRows = [];
  }

  // ✅ Add New Column
  addColumn(): void {
    const newColumnName = prompt('Enter the new column name:');
    if (!newColumnName) return;

    const newCol = { field: newColumnName.toLowerCase(), headerName: newColumnName };
    this.displayedColumns.push(newCol);
    this.combinedColumns = ['select', ...this.displayedColumns.map(col => col.field), 'pdfLink', 'actions'];

    this.rowData.forEach(row => row[newCol.field] = '');
    this.dataSource.data = [...this.rowData];
  }

  // ✅ Delete Column
  deleteColumn(columnField: string): void {
    this.displayedColumns = this.displayedColumns.filter(col => col.field !== columnField);
    this.combinedColumns = ['select', ...this.displayedColumns.map(col => col.field), 'pdfLink', 'actions'];

    this.rowData.forEach(row => delete row[columnField]);
    this.dataSource.data = [...this.rowData];
  }

  // ✅ Edit Column Name
  editColumnName(column: any): void {
    const newHeaderName = prompt('Enter new column name:', column.headerName);
    if (newHeaderName) {
      column.headerName = newHeaderName;
    }
  }

  // ✅ Upload PDF to Firebase
  uploadPDF(row: any): void {
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
        const rowRef = doc(this.firestore, `specSheetRows/${row.id}`);
        setDoc(rowRef, row);
      }
    };

    input.click();
  }
}