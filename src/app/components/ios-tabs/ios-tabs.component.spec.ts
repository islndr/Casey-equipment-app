import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IosTabsComponent } from './ios-tabs.component';

describe('IosTabsComponent', () => {
  let component: IosTabsComponent;
  let fixture: ComponentFixture<IosTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IosTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IosTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
