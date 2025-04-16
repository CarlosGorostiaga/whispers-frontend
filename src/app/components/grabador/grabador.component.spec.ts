import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrabadorComponent } from './grabador.component';

describe('GrabadorComponent', () => {
  let component: GrabadorComponent;
  let fixture: ComponentFixture<GrabadorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GrabadorComponent]
    });
    fixture = TestBed.createComponent(GrabadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
