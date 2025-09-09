import { Component, inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { HeaderComponent } from '../../../layout/header/header.component';
import { ContaCasaComponent } from "./conta-casa/conta-casa.component";
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [HeaderComponent, ContaCasaComponent, NgClass, NgIf],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private auth = inject(AuthService);
  index = 1;

  logout() { this.auth.signOut().subscribe(); }

}