import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecSheetTableComponent } from './spec-sheet-table.component';

describe('SpecSheetTableComponent', () => {
  let component: SpecSheetTableComponent;
  let fixture: ComponentFixture<SpecSheetTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecSheetTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecSheetTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
