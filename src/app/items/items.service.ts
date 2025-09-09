import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, updateDoc, query, where, orderBy, setDoc } from '@angular/fire/firestore';
import { AuthService } from '../feature/auth/auth.service';
import { serverTimestamp } from 'firebase/firestore';
import { Observable, switchMap } from 'rxjs';
import { ContaCasaDoc } from '../feature/panel/dashboard/conta-casa/conta-casa.component';

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private ref = (mesId: string) => doc(this.firestore, 'contaCasa', mesId);
  private MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];




  /** Lista somente do usuário logado */
  list$ = this.auth.user$.pipe(
    switchMap(user => {
      if (!user) return [];
      const col = collection(this.firestore, 'items');
      const q = query(col, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      return collectionData(q, { idField: 'id' }) as any;
    })
  );

  get(document: string, id: string):Observable<ContaCasaDoc> {
    const ref = doc(this.firestore, document, id);
    return docData(ref, { idField: 'id' }) as any;
  }

  async createMes(mesId: string) {
    const [a, m] = mesId.split('-');
    let ano = Number(a);
    let mes = this.MESES[Number(m) - 1];
    if (!mes || Number.isNaN(ano)) {
      ano = Number(new Date().getFullYear),
      mes =  this.MESES[Number(new Date().getMonth())];
    }



    await setDoc(this.ref(mesId), {
      content: [],
      mes,
      ano,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
  async saveMes( mesId: string, payload: ContaCasaDoc ) {
    await updateDoc(this.ref(mesId), {
      ano: Number(payload.ano),
      mes: String(payload.mes),
      content: payload.content,
      updatedAt: serverTimestamp(),
    });
  }

  toISODate(input: unknown): string {
    // já vem como "YYYY-MM-DD"?
    if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
      return input;
    }

    let d: Date | undefined;

    if (input && typeof (input as any).toDate === 'function') {
      // Firestore Timestamp
      d = (input as any).toDate();
    } else if (input instanceof Date) {
      d = input;
    } else if (typeof input === 'number') {
      d = new Date(input);
    } else if (typeof input === 'string') {
      const tmp = new Date(input);
      if (!Number.isNaN(tmp.getTime())) d = tmp;
    }

    if (!d || Number.isNaN(d.getTime())) d = new Date(); // fallback

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  fromISOToMs(s: string): number {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d).getTime();
  }
}
