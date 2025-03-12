import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IOSSpecSheetsComponent } from './ios-spec-sheets.component';

describe('IosSpecSheetsComponent', () => {
  let component: IOSSpecSheetsComponent;
  let fixture: ComponentFixture<IOSSpecSheetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IOSSpecSheetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IOSSpecSheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
