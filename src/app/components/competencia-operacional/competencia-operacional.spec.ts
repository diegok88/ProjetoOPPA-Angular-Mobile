import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetenciaOperacional } from './competencia-operacional';

describe('CompetenciaOperacional', () => {
  let component: CompetenciaOperacional;
  let fixture: ComponentFixture<CompetenciaOperacional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetenciaOperacional],
    }).compileComponents();

    fixture = TestBed.createComponent(CompetenciaOperacional);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
