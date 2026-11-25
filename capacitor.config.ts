import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.org.oppa.mobile',
  appName: 'OPPA',
  webDir: 'dist/ProjetoOPPA-AngularMobile/browser',
  server: {
    androidScheme: 'https',
    cleartext: true, // libera http:// no WebView (somente para desenvolvimento)
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
