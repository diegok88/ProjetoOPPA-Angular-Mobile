import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { UserGuard } from '../interfaces/user-guard.interface';
import { RequestHttp } from '../constants/requests.const';
import { LoginModel } from '../entities/login.model';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { TOKEN_KEY } from '../constants/auth-token.interceptor';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = RequestHttp.auth;
  private perfilSignal = signal<UserGuard | null>(null);

  public usuario = this.perfilSignal.asReadonly();
  public role = computed(() => this.perfilSignal()?.desPerfil ?? null);

  login(credencial: LoginModel): Observable<AuthResponse> {
    this.perfilSignal.set(null);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credencial).pipe(
      tap((res) => {
        if (res.accessToken) localStorage.setItem(TOKEN_KEY, res.accessToken);
      }),
    );
  }

  logout(): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/logout`, {})
      .pipe(finalize(() => this.limparSessao()));
  }

  obterPerfil(force = false): Observable<UserGuard> {
    if (!force) {
      const cache = this.perfilSignal();
      if (cache) return of(cache);
    }
    return this.http
      .get<UserGuard>(`${this.apiUrl}/profile`)
      .pipe(tap((usuario) => this.perfilSignal.set(usuario)));
  }

  getPerfil(): UserGuard | null {
    return this.perfilSignal();
  }

  getRole(): string | null {
    return this.role();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private limparSessao(): void {
    this.perfilSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
  }
}
