import { Injectable, inject } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, updateProfile } from '@angular/fire/auth';
import { from, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  /** Observable com o usuário logado (ou null) */
  user$ = authState(this.auth);

  signUpEmailPassword(email: string, password: string, displayName?: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      // opcional: setar displayName
      map(async cred => {
        if (displayName) {
          await updateProfile(cred.user, { displayName });
        }
        return cred.user;
      })
    );
  }

  signInEmailPassword(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider));
  }

  signOut() {
    return from(signOut(this.auth));
  }

  /** Snapshot do usuário atual (não reativo) */
  get currentUser() {
    return this.auth.currentUser;
  }

  /** Observable booleano de sessão */
  isLoggedIn$ = this.user$.pipe(map(u => !!u));
}
