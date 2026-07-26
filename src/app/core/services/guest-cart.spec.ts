import { TestBed } from '@angular/core/testing';

import { GuestCart } from './guest-cart';

describe('GuestCart', () => {
  let service: GuestCart;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuestCart);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
