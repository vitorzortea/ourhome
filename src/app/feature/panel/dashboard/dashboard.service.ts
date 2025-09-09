import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  mesSelect$ = new BehaviorSubject(this.getMouth());
  ano = Number(new Date().getFullYear());
  mes = this.MESES[Number(new Date().getMonth())];

  getMouth(data?:Date):string{
    if(!data){ data= new Date(); }
    const mes = data.getMonth();
    const id = data.getFullYear()+'-'+(mes <= 8 ? '0'+(mes+1) : mes+1);
  
    this.ano = Number(data.getFullYear());
    this.mes = this.MESES[Number(mes)];
    return id;
  }
}
