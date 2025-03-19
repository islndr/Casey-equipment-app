import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Share } from '@capacitor/share';
import { SafePipe } from '../safe.pipe';
import { CommonModule } from '@angular/common';
import { defineCustomElements } from 'ionicons/dist/loader';
defineCustomElements(window);

@Component({
  selector: 'app-ios-pdf-viewer',
  templateUrl: './ios-pdf-viewer.component.html',
  styleUrls: ['./ios-pdf-viewer.component.css'],
  standalone: true,
  imports: [SafePipe, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PdfViewerComponent {
  @Input() pdfUrl: string = '';
  @Input() isOpen: boolean = false;
  @Input() refreshKey: number = Date.now();

  closeModal() {
    // When closing, you may want to clear the URL so the element is fully removed
    this.isOpen = false;
  }

  async sharePdf() {
    try {
      await Share.share({
        title: 'Share PDF',
        text: 'Check out this PDF',
        url: this.pdfUrl, // or you could also share the complete URL with refreshKey if needed
        dialogTitle: 'Share this PDF'
      });
    } catch (error) {
      console.error('Error sharing PDF:', error);
    }
  }
}