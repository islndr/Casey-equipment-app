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
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { MatTableModule } from '@angular/material/table';
import { SafePipe } from '../safe.pipe';

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
    SafePipe
  ]
})
export class SpecSheetTableComponent implements OnInit {
  displayedColumns: any[] = [];
  combinedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>([]);
  selectedRows: any[] = [];
  editingRowId: string | null = null;
  pdfModalOpen: boolean = false;
  selectedPDFRow: any = null;
  sortDirection: { [key: string]: 'asc' | 'desc' } = {};

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
      this.displayedColumns.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      if (this.displayedColumns.length === 0) {
        this.displayedColumns = [
          { headerName: 'Title', field: 'title', order: 1 },
          { headerName: 'Description', field: 'description', order: 2 }
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
      .filter(col => col.field !== 'id')
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(col => col.field), 'pdfLink'];
  }








/** ✅ Add New Row and Apply Sorting */
addRow() {
  const newRow = { id: uuidv4(), title: '', description: '', pdfLink: '', isEditing: true };
  this.dataSource.data = [...this.dataSource.data, newRow];
  this.editingRowId = newRow.id;
  this.saveRow(newRow); // Save new row immediately to trigger sort
  this.applyCurrentSort(); // Apply existing sort to include the new row
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

/** ✅ Enable Row Editing and Handle Enter Across All Columns */
/** ✅ Enable Row Editing and Focus on Click */
editRow(row: any, field: string) {
  this.editingRowId = row.id;
  row.isEditing = true;

  setTimeout(() => {
    const inputElement = document.querySelector(`input[data-row-id="${row.id}"][data-field="${field}"]`) as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
      inputElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          this.saveRow(row);           // Save the row on Enter
          this.editingRowId = null;    // Exit edit mode
        }
      });
    }
  }, 0);
}

/** ✅ Save Row and Reapply Sorting */
saveRow(row: any) {
  row.isEditing = false;
  const rowRef = doc(this.firestore, `specSheetRows/${row.id}`);
  setDoc(rowRef, row).then(() => {
    this.applyCurrentSort(); // Apply current sort after saving
  });
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

  /** ✅ Add New Column with Order */
  addColumn() {
    const newColumnName = prompt('Enter the new column name:');
    const columnOrder = Number(prompt('Enter the column order (lowest = left, highest = right):'));

    if (!newColumnName || isNaN(columnOrder)) return;

    const sanitizedField = newColumnName.toLowerCase().replace(/\s+/g, '_');
    const newCol = { headerName: newColumnName, field: sanitizedField, order: columnOrder };

    this.displayedColumns.forEach(col => {
      if (col.order >= columnOrder) col.order += 1;
    });

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

/** ✅ Sort Column with Toggle Direction */
sortColumn(field: string) {
  const direction = this.sortDirection[field] === 'asc' ? 'desc' : 'asc';
  this.sortDirection = {}; // Clear previous sorts
  this.sortDirection[field] = direction;

  this.dataSource.data.sort((a, b) => {
    const aValue = a[field]?.toString().toLowerCase() || '';
    const bValue = b[field]?.toString().toLowerCase() || '';
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  this.dataSource._updateChangeSubscription();
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