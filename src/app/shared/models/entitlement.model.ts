export type EntitlementTier = 'free' | 'premium';

export interface EntitlementStatus {
  tier: EntitlementTier;
  since?: string;
  productId?: string;
}

export interface PremiumProduct {
  id: string;
  title: string;
  description: string;
  price: string;
}
