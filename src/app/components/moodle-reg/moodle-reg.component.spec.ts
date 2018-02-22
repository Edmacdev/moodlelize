import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoodleRegComponent } from './moodle-reg.component';

describe('MoodleRegComponent', () => {
  let component: MoodleRegComponent;
  let fixture: ComponentFixture<MoodleRegComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoodleRegComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoodleRegComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
