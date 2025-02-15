import { Component } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-spec-sheet-table',
  templateUrl: './spec-sheet-table.component.html',
  styleUrls: ['./spec-sheet-table.component.scss']
})
export class SpecSheetTableComponent {
  constructor(private storage: Storage) {}

  async uploadFile(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const fileRef = ref(this.storage, `spec-sheets/${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    console.log('File URL:', downloadURL);
  }
}