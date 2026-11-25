import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlocacaoOperacional } from './alocacao-operacional';

describe('AlocacaoOperacional', () => {
  let component: AlocacaoOperacional;
  let fixture: ComponentFixture<AlocacaoOperacional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlocacaoOperacional],
    }).compileComponents();

    fixture = TestBed.createComponent(AlocacaoOperacional);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
