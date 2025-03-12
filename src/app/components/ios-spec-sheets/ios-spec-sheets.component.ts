import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { Firestore, collection, collectionData, query, where, doc, setDoc } from '@angular/fire/firestore';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { NgFor } from '@angular/common'; // ✅ Import NgFor & NgIf

@Component({
  selector: 'app-ios-spec-sheets',
  standalone: true,
  templateUrl: './ios-spec-sheets.component.html',
  styleUrls: ['./ios-spec-sheets.component.css'],
  imports: [NgFor], // ✅ Add NgFor & NgIf to imports
})
export class IOSSpecSheetsComponent implements OnInit, OnChanges {
  displayedColumns: any[] = [];
  combinedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>([]);
  @Input() activeTabId: string | null = null;
  specSheetId: string | null = null;

  constructor(
    private firestore: Firestore,
    private route: ActivatedRoute,
    private router: Router,
    private auth: Auth
  ) {}

  async ngOnInit(): Promise<void> {
    this.activeTabId = this.route.snapshot.paramMap.get('id');
    if (this.activeTabId) {
      console.log(`📌 Selected Tab ID: ${this.activeTabId}`);
      await this.loadSpecSheet();
    } else {
      console.error("❌ No tabId found in URL.");
    }

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
      const specSheets = await firstValueFrom(collectionData(specSheetQuery, { idField: 'id' })) ?? [];

      if (specSheets.length === 0) {
        console.warn(`⚠️ No spec sheet found for tabId: ${this.activeTabId}`);
        return;
      }

      this.specSheetId = specSheets[0].id;
      console.log(`✅ Found specSheetId: ${this.specSheetId}`);

      await this.loadColumns();
      await this.loadRows();
    } catch (error) {
      console.error('❌ Error loading spec sheet:', error);
    }
  }

  updateCombinedColumns() {
    this.combinedColumns = this.displayedColumns.map(col => col.field);
  }

  async loadColumns() {
    if (!this.specSheetId) return;
  
    console.log(`📥 Fetching columns for specSheetId: ${this.specSheetId}`);
  
    const columnsRef = collection(this.firestore, `specSheets/${this.specSheetId}/columns`);
  
    collectionData(columnsRef, { idField: 'id' }).subscribe((columns: any[] = []) => {
      console.log(`📊 Loaded Columns:`, columns);
      // ✅ Sort columns by their order number
      this.displayedColumns = columns.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      this.updateCombinedColumns();
    });
  }

  async loadRows() {
    if (!this.specSheetId) return;
    console.log(`📥 Fetching rows for specSheetId: ${this.specSheetId}`);

    const rowsRef = collection(this.firestore, `specSheets/${this.specSheetId}/rows`);
    collectionData(rowsRef, { idField: 'id' }).subscribe((rows: any[] = []) => {
      console.log(`📋 Loaded Rows:`, rows);
      this.dataSource.data = rows.map(row => ({ ...row }));
    });
  }

  /** ✅ Extracts keys in the order of displayedColumns (Excludes "id") */

  getKeys(row: any): string[] {
    return this.displayedColumns.map(col => col.field).filter(key => key in row);
  }

  /** ✅ Sorts rows based on first column value */
  sortedRows(): any[] {
    return this.dataSource.data.sort((a, b) => {
      const firstKey = this.getKeys(a)[0]; // Get first available key for sorting
      if (!firstKey) return 0;
  
      const valueA = this.parseSortableValue(a[firstKey]);
      const valueB = this.parseSortableValue(b[firstKey]);
  
      // ✅ Ensure correct numerical sorting
      return valueA - valueB;
    });
  }

  /** ✅ Converts numbers, fractions, and text into sortable values */
  parseSortableValue(value: any): number {
    if (typeof value === 'number') return value; 
    if (typeof value === 'string') return this.parseFraction(value.trim()); 
    return 0;
  }

  /** ✅ Converts fractions and mixed numbers to decimals */
  parseFraction(value: string): number {
    if (!value) return 0;
  
    // ✅ Handle whole numbers and decimals
    if (!value.includes('/')) return parseFloat(value) || 0;
  
    // ✅ Handle mixed fractions (e.g., "3 3/4")
    const mixedFractionMatch = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixedFractionMatch) {
      const whole = parseInt(mixedFractionMatch[1], 10);
      const numerator = parseInt(mixedFractionMatch[2], 10);
      const denominator = parseInt(mixedFractionMatch[3], 10);
      return whole + numerator / denominator;
    }
  
    // ✅ Handle simple fractions (e.g., "1/4", "1/3")
    const fractionMatch = value.match(/^(\d+)\/(\d+)$/);
    if (fractionMatch) {
      const numerator = parseInt(fractionMatch[1], 10);
      const denominator = parseInt(fractionMatch[2], 10);
      return numerator / denominator;
    }
  
    return parseFloat(value) || 0;
  }

  transformKey(key: string): string {
    return key ? key.split('_').join(' ').toUpperCase() : '';
  }
  getFirstValue(row: any): string {
    const firstKey = this.getKeys(row)[0]; // Get the first column key
    return firstKey ? row[firstKey] : 'Unnamed'; // Return the first value
  }
  
  openPDF(pdfUrl: string) {
    if (!pdfUrl) {
      return;
    }
    window.open(pdfUrl, '_blank'); // ✅ Opens PDF in a new tab
  }
}