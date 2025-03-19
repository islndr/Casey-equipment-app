import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.caseyequipment.app',
  appName: 'Casey Equipment',
  webDir: 'dist/casey-equipment-app/browser',
  server: {
    cleartext: true,
    url: 'http://localhost:4200'
  },

};

export default config;

