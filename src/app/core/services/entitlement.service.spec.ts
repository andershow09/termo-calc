import { EntitlementService } from './entitlement.service';
describe('Portfolio access', () => {
  it('exposes the demo without a store connection or commercial metadata', async () => {
    const service = new EntitlementService();
    expect(service.unlocked()).toBeTrue();
    expect(service.monetizationEnabled).toBeFalse();
    expect(service.getProduct().id).toBe('portfolio-demo');
    expect(await service.purchase()).toEqual(await service.load());
  });
});

