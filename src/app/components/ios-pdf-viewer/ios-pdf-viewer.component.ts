import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Share } from '@capacitor/share';
import { CommonModule } from '@angular/common';
import { SafePipe } from '../safe.pipe';

@Component({
  selector: 'app-ios-pdf-viewer',
  standalone: true,
  templateUrl: './ios-pdf-viewer.component.html',
  styleUrls: ['./ios-pdf-viewer.component.css'],
  imports: [CommonModule, SafePipe]
})
export class IOSPDFViewerComponent implements OnInit {
  pdfUrl: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.pdfUrl = this.route.snapshot.paramMap.get('pdfUrl');
  }

  /** ✅ Close the PDF Viewer */
  closeViewer(): void {
    this.router.navigate(['/tabs']);
  }

  /** ✅ Share the PDF */
  async sharePDF(): Promise<void> {
    if (this.pdfUrl) {
      try {
        await Share.share({
          title: 'Check out this PDF',
          url: this.pdfUrl,
          dialogTitle: 'Share PDF',
        });
      } catch (error) {
        console.error('Error sharing PDF:', error);
      }
    }
  }
}