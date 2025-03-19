import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safe',
  pure: false 
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: any, type: string): SafeResourceUrl {
    if (type === 'resourceUrl') {
      return this.sanitizer.bypassSecurityTrustResourceUrl(value);
    }
    throw new Error(`Invalid safe type specified: ${type}`);
  }
}



