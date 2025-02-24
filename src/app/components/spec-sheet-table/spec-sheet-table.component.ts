import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spec-sheet-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './spec-sheet-table.component.html',
  styleUrls: ['./spec-sheet-table.component.css']
})
export class SpecSheetTableComponent implements OnInit {
  displayedColumns: string[] = ['title', 'description', 'pdfLink', 'actions'];
  dataSource = [
    { title: 'Sample 1', description: 'First row', pdfLink: '' },
    { title: 'Sample 2', description: 'Second row', pdfLink: '' }
  ];

  ngOnInit() {}

  addRow() {
    this.dataSource = [...this.dataSource, { title: '', description: '', pdfLink: '' }];
  }

  deleteRow(index: number) {
    this.dataSource.splice(index, 1);
    this.dataSource = [...this.dataSource];
  }
}