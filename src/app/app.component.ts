import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

import { EntitlementService } from './core/services/entitlement.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private readonly entitlement = inject(EntitlementService);

  constructor() {
    void this.entitlement.load();
  }
}
