import { Component, inject } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DashboardService } from '../dashboard.service';
import { ItemsService } from '../../../../items/items.service';
import { switchMap, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2'


interface Lancamento {  
  data: number;
  nome: string;
  pagante: number;
  valor: number;
}

export interface ContaCasaDoc {
  id?: string;
  content: Lancamento[];
  mes:string;
  ano:number
}

type LancamentoGroup = FormGroup<{
  data: FormControl<string>;
  nome: FormControl<string>;
  pagante: FormControl<number>;
  valor: FormControl<number>;
}>;

export type ContaCasaGroup = FormGroup<{
  id: FormControl<string>;
  ano: FormControl<number>;
  mes: FormControl<string>;
  content: FormArray<LancamentoGroup>;
}>;

function integerValidator(ctrl: AbstractControl): ValidationErrors | null {
  const v = ctrl.value;
  if (v === null || v === undefined || v === '') return null;
  return Number.isInteger(Number(v)) ? null : { integer: true };
}


@Component({
  selector: 'app-conta-casa',
  standalone:true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './conta-casa.component.html',
  styleUrl: './conta-casa.component.scss'
})
export class ContaCasaComponent {
  private item = inject(ItemsService);
  private dashboard = inject(DashboardService);
  private fb = inject(NonNullableFormBuilder);
  trackByControl = (_: number, ctrl: AbstractControl) => ctrl;

  

  formMes: ContaCasaGroup = this.fb.group({
    id: this.fb.control('', { validators: [Validators.minLength(7)] }),
    ano: this.fb.control(2025, { validators: [Validators.required, Validators.min(2010)] }),
    mes: this.fb.control('', { validators: [Validators.required, Validators.minLength(2)] }),
    content: this.fb.array<LancamentoGroup>([]),
  });
  get contentFA(): FormArray<LancamentoGroup> { return this.formMes.controls.content; }

  contaCasa$ = this.dashboard.mesSelect$.pipe(
    switchMap(mesId =>
      this.item.get('contaCasa', mesId).pipe(
        tap({
          next: (doc:ContaCasaDoc) => this.reloadDoc(mesId, doc),
          error: (err) => console.error('tap error:', err),
        })
      )
    )
  );

  private setForm(mesSelect:string, item?: ContaCasaDoc) {
    if (!item) item = { ano: 0, mes: '', content: [] };

    this.formMes.patchValue({
      id: mesSelect,
      ano: item.ano !== 0 ? item.ano : this.dashboard.ano,
      mes: item.mes || this.dashboard.mes
    });

    const arr = this.fb.array<LancamentoGroup>(
      (item.content ?? []).map(it => this.makeItem(it))
    );

    this.formMes.setControl('content', arr); // <-- nova referência
    this.formMes.updateValueAndValidity({ emitEvent: false });
  }
  private makeItem(it?: Lancamento): LancamentoGroup {
    return this.fb.group({
      data: this.fb.control(this.item.toISODate(it?.data ?? Date.now()), { validators: [Validators.required] }),
      nome: this.fb.control(it?.nome ?? '', { validators: [Validators.required, Validators.minLength(2)] }),
      pagante: this.fb.control(it?.pagante ?? 1, { validators: [Validators.required, integerValidator] }),
      valor: this.fb.control(it?.valor ?? 0.00, { validators: [Validators.required, Validators.min(0.01)] }),
    });
  }
  private reloadDoc(mesSelect:string, doc:ContaCasaDoc) {
      if (!doc) {
        this.item.createMes(mesSelect);
        this.setForm(mesSelect);
      }else{
        this.setForm(mesSelect, doc);
      }
  };

  addConta(){ this.formMes.controls.content.push(this.makeItem()); }
  removeConta(index: number): void {
    const fa = this.formMes.controls.content;
    if (index < 0 || index >= fa.length) {
      console.warn('Index inválido:', index);
      return;
    }
    fa.removeAt(index, { emitEvent: true });
    fa.markAsDirty();
    fa.updateValueAndValidity({ onlySelf: false, emitEvent: true });
  }
  
  editarTabelas() {
    if (this.formMes.invalid) {
      this.formMes.markAllAsTouched();
      return;
    }

    const raw = this.formMes.getRawValue();
    
    const toNum = (v: any) =>
      typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v);

    const content: Lancamento[] = raw.content.map((g) => ({
      data: this.item.fromISOToMs(g.data),
      nome: g.nome,
      pagante: toNum(g.pagante),
      valor: toNum(g.valor),
    }));

    const payload:ContaCasaDoc = { ano: toNum(raw.ano), mes: String(raw.mes), content, };

    this.item.saveMes(raw.id, payload)
      .then(()=>{
        Swal.fire({icon:'success', title:'Sucesso!', text:'As Contas da Casa de '+raw.mes+' foram salvos'})
      })
      .catch(err =>{
        Swal.fire({icon:'error', title:'Erro!', text:"Algo deu errado"})
        console.error('Falha ao salvar:', err)
      });
  }

  get totalCasa(){
    return this.formMes.getRawValue().content.reduce((sum, { valor }) => sum + valor, 0);
  }
  get totalVitor(){
    return this.formMes.getRawValue().content.filter(e=>e.pagante == 1).reduce((sum, { valor }) => sum + valor, 0);
  }
  get totalMarconis(){
    return this.formMes.getRawValue().content.filter(e=>e.pagante == 2).reduce((sum, { valor }) => sum + valor, 0);
  }
  get totalDiferenca(){
    return ((this.totalVitor > this.totalMarconis) ? this.totalVitor - this.totalMarconis : this.totalMarconis - this.totalVitor)/2
  }

}

