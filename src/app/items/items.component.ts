import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemsService } from './items.service';
import { Observable } from 'rxjs';
import { Item } from './item.model';

@Component({
  standalone: true,
  selector: 'app-items',
  imports: [CommonModule, FormsModule],
  template: `
  <section>
    <h2>Itens</h2>

    <!-- Create -->
    <form (ngSubmit)="add()">
      <input [(ngModel)]="title" name="title" placeholder="Novo item" required />
      <button type="submit">Adicionar</button>
    </form>

    <!-- Read -->
    <ul>
      <li *ngFor="let it of items$ | async">
        <input type="checkbox" [checked]="it.done" (change)="toggle(it)" />
        <span [style.textDecoration]="it.done ? 'line-through' : 'none'">
          {{ it.title }}
        </span>
        <button (click)="remove(it)">Excluir</button>
      </li>
    </ul>
  </section>
  `
})
export class ItemsComponent {
  private svc = inject(ItemsService);
  items$!: Observable<Item[]>;
  title = '';

  ngOnInit() {
    this.items$ = this.svc.list$ as Observable<Item[]>;
  }

  add() {
    const t = this.title.trim();
    if (!t) return;
    this.svc.create({ title: t, done: false }).subscribe();
    this.title = '';
  }

  toggle(it: Item) {
    this.svc.update(it.id!, { done: !it.done }).subscribe();
  }

  remove(it: Item) {
    this.svc.delete(it.id!).subscribe();
  }
}
