import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoConfirmar } from './dialogo-confirmar';

describe('DialogoConfirmar', () => {
  let component: DialogoConfirmar;
  let fixture: ComponentFixture<DialogoConfirmar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoConfirmar],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogoConfirmar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
