import { Injectable, signal } from '@angular/core';
import { EntitlementStatus, PremiumProduct } from '../../shared/models/entitlement.model';

// Compatibility adapter for the portfolio UI; no store, pricing or access rules.
export const FREE_SAVED_LIMIT = Number.POSITIVE_INFINITY;
@Injectable({ providedIn: 'root' })
export class EntitlementService {
  readonly premium = signal<EntitlementStatus>({ tier: 'premium' }).asReadonly();
  readonly unlocked = signal(true).asReadonly();
  readonly monetizationEnabled = false;
  async load(): Promise<EntitlementStatus> { return this.premium(); }
  isPremium(): boolean { return true; }
  getProduct(): PremiumProduct {
    return { id: 'portfolio-demo', title: 'Demonstração', description: 'Recursos demonstrativos', price: 'Sem cobrança' };
  }
  async purchase(): Promise<EntitlementStatus> { return this.premium(); }
  async restore(): Promise<EntitlementStatus> { return this.premium(); }
}

