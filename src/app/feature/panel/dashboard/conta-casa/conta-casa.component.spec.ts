import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContaCasaComponent } from './conta-casa.component';

describe('ContaCasaComponent', () => {
  let component: ContaCasaComponent;
  let fixture: ComponentFixture<ContaCasaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContaCasaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContaCasaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
