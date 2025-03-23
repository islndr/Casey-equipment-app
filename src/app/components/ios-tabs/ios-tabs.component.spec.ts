import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IOSTabsComponent } from './ios-tabs.component';

describe('IosTabsComponent', () => {
  let component: IOSTabsComponent;
  let fixture: ComponentFixture<IOSTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IOSTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IOSTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
