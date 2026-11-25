import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { RequestHttp } from '../constants/requests.const';
import { PerfilModel } from '../entities/perfil.model';

@Injectable({
  providedIn: 'root',
})
export class PerfilService {
  private http = inject(HttpClient);
  private apiUrl = RequestHttp.perfil;

  private buscarPerfilSignal = signal<PerfilModel | null>(null);
  public buscarPerfil = this.buscarPerfilSignal.asReadonly();

  /* BUSCA O DADOS UNICO SOLICITADO */
  buscar(id: string): Observable<PerfilModel> {
    return this.http.get<PerfilModel>(`${this.apiUrl}/${id}`).pipe(
      tap((dado) => {
        this.buscarPerfilSignal.set(dado);
      }),
      catchError((error) => throwError(() => error)),
    );
  }

  /* LIMPEZA DOS SIGNALS DE LISTAR E BUSCAR */
  public limparBuscar() {
    this.buscarPerfilSignal.set(null);
  }
}
