import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  displayName = '';
  email = '';
  password = '';
  error = signal<string|undefined>(undefined);

  register() {
    this.auth.signUpEmailPassword(this.email, this.password, this.displayName).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (e) => this.error.set(e.message)
    });
  }
}