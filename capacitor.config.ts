import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.caseyequipment.app',
  appName: 'Casey Equipment',
  webDir: 'dist/casey-equipment-app/browser',
  server: {
    cleartext: true
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com", "apple.com", "facebook.com"]
    }
  }
};

export default config;