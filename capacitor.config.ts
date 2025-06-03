import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cs.pdf.share',
  appName: 'cs-pdf-share',
  webDir: 'www/browser',
  server: {
    androidScheme: 'https',
  },
};

export default config;
