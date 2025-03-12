import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IosPdfViewerComponent } from './ios-pdf-viewer.component';

describe('IosPdfViewerComponent', () => {
  let component: IosPdfViewerComponent;
  let fixture: ComponentFixture<IosPdfViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IosPdfViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IosPdfViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
