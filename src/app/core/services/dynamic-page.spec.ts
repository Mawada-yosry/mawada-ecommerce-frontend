import { TestBed } from '@angular/core/testing';

import { DynamicPage } from './dynamic-page';

describe('DynamicPage', () => {
  let service: DynamicPage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicPage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
