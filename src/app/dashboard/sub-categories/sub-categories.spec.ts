import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubCategories } from './sub-categories';

describe('SubCategories', () => {
  let component: SubCategories;
  let fixture: ComponentFixture<SubCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubCategories],
    }).compileComponents();

    fixture = TestBed.createComponent(SubCategories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
