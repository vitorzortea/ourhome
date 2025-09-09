import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

  @Component({
    standalone: true,
    selector: 'app-login',
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
  })

export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  error = signal<string|undefined>(undefined);

  login() {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.auth.signInEmailPassword(this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl(returnUrl),
      error: (e) => this.error.set(e.message)
    });
  }

  google() {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.auth.signInWithGoogle().subscribe({
      next: () => this.router.navigateByUrl(returnUrl),
      error: (e) => this.error.set(e.message)
    });
  }
}