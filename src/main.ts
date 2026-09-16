import { bootstrapApplication } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import { SplashScreen } from '@capacitor/splash-screen';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

const MIN_BOOT_LOADER_MS = 2000;
registerLocaleData(localePt, 'pt-BR');

// A splash nativa é ocultada em index.html assim que o loader HTML pinta; este
// tempo mínimo evita que o loader (#boot-loader) pisque rápido demais antes da home.
const minBootLoaderDuration = new Promise((resolve) =>
  setTimeout(resolve, MIN_BOOT_LOADER_MS),
);

// Sem preload das demais rotas: evita concorrência de rede com o carregamento inicial da home.
Promise.all([
  bootstrapApplication(AppComponent, {
    providers: [
      { provide: LOCALE_ID, useValue: 'pt-BR' },
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      provideIonicAngular(),
      provideRouter(routes),
    ],
  }),
  minBootLoaderDuration,
])
  .then(() => {
    document.getElementById('boot-loader')?.remove();
    // Fallback: garante que a splash nativa foi ocultada (normalmente já em index.html).
    return SplashScreen.hide();
  })
  .catch((error) => console.error('Erro ao iniciar o app', error));
