import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-spec-sheet-table',
  standalone: true,
  templateUrl: './spec-sheet-table.component.html',
  styleUrls: ['./spec-sheet-table.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule
  ]
})
export class SpecSheetTableComponent implements OnInit {
  tabName: string = 'Equipment';
  rowData: any[] = [];
  columnDefs: any[] = [
    { headerName: 'Title', field: 'title', editable: true },
    { headerName: 'Description', field: 'description', editable: true }
  ];
  displayedColumns: string[] = ['select', 'title', 'description', 'pdfLink'];
  selectedRows: any[] = [];

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    this.loadData();
  }

  // ✅ Load Data from Firestore
  loadData() {
    const rowsRef = collection(this.firestore, 'specSheetRows');
    collectionData(rowsRef, { idField: 'id' }).subscribe(data => {
      this.rowData = data.map(row => ({ ...row, editing: false }));
    });

    const columnsRef = collection(this.firestore, 'specSheetColumns');
    collectionData(columnsRef).subscribe(data => {
      this.columnDefs = data
        .filter(col => col['field'])
        .map(col => ({ ...col, editing: false }));

      this.displayedColumns = ['select', ...this.columnDefs.map(c => c.field), 'pdfLink'];
    });
  }

  // ✅ Add New Row
  addRow() {
    const newRow = { id: Date.now().toString(), title: '', description: '', pdfLink: '' };
    this.rowData.push(newRow);
    const rowsRef = collection(this.firestore, 'specSheetRows');
    setDoc(doc(rowsRef, newRow.id), newRow);
  }

  // ✅ Add New Column with Validation
  addColumn() {
    const newColumnName = prompt('Enter the new column name:');
    if (!newColumnName) return;

    const sanitizedField = newColumnName.toLowerCase().replace(/\s+/g, '_');

    if (this.columnDefs.some(col => col.field === sanitizedField)) {
      alert('Column with this name already exists!');
      return;
    }

    const newCol = {
      headerName: newColumnName,
      field: sanitizedField,
      editable: true
    };

    this.columnDefs.push(newCol);
    this.displayedColumns = ['select', ...this.columnDefs.map(c => c.field), 'pdfLink'];

    const columnsRef = collection(this.firestore, 'specSheetColumns');
    setDoc(doc(columnsRef, newCol.field), newCol);
  }

  // ✅ Delete Selected Rows
  removeSelectedRows() {
    this.selectedRows.forEach(row => {
      this.rowData = this.rowData.filter(data => data.id !== row.id);
      const rowRef = doc(this.firestore, `specSheetRows/${row.id}`);
      deleteDoc(rowRef);
    });
    this.selectedRows = [];
  }

  // ✅ Select/Deselect All Rows
  toggleSelectAll(event: any) {
    const isChecked = event.checked;
    this.rowData.forEach(row => (row.selected = isChecked));
    this.selectedRows = isChecked ? [...this.rowData] : [];
  }

  // ✅ Row Selection
  toggleRowSelection(row: any, event: any) {
    row.selected = event.checked;
    if (event.checked) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows = this.selectedRows.filter(r => r.id !== row.id);
    }
  }

  // ✅ PDF Upload
  uploadPDF(row: any) {
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

  // ✅ Cell Edit Save
  onCellValueChanged(row: any) {
    const rowRef = doc(this.firestore, `specSheetRows/${row.id}`);
    setDoc(rowRef, row);
  }

  // ✅ Update Column Name with Prompt
  triggerColumnNameEdit(field: string) {
    const newName = prompt('Enter new column name:');
    if (newName) {
      this.updateColumnName(field, newName);
    }
  }

  updateColumnName(field: string, newName: string) {
    const colIndex = this.columnDefs.findIndex(col => col.field === field);
    if (colIndex !== -1) {
      this.columnDefs[colIndex].headerName = newName;
      const colRef = doc(this.firestore, `specSheetColumns/${field}`);
      setDoc(colRef, this.columnDefs[colIndex]);
    }
  }
}