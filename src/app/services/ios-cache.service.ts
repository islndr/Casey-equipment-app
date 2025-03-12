import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IosCacheService {
  async getCachedPdf(url: string): Promise<string> {
    const cachedFile = await caches.open('pdf-cache').then(cache => cache.match(url));
    if (cachedFile) {
      return cachedFile.url; // Return cached URL if available
    }
    await this.cachePdf(url);
    return url;
  }

  async cachePdf(url: string) {
    const cache = await caches.open('pdf-cache');
    await cache.add(url);
  }
}