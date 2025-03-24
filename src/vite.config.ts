import { defineConfig } from 'vite';
import { ngVite } from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [ngVite()],
  optimizeDeps: {
   
  }
});