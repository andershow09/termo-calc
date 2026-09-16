import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.termocalc.portfolio',
  appName: 'TermoCalc Demo',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      // Mantida até o loader HTML estar pintado; ocultada por JS em index.html,
      // evitando o flash preto do WebView entre a splash e o loader.
      launchAutoHide: false,
      backgroundColor: '#ffffffff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#6a0080',
    },
  },
};

export default config;
