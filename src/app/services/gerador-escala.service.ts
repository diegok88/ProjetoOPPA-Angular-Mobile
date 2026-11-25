import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { RequestHttp } from '../constants/requests.const';
import { GeradorEscalaModel } from '../entities/gerador-escala.model';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeradorEscalaService {
  private http = inject(HttpClient);
  private apiUrl = RequestHttp.gerador_escala;

  private buscarEscalaSignal = signal<GeradorEscalaModel | null>(null);
  public buscarEscala = this.buscarEscalaSignal.asReadonly();

  buscar(): Observable<GeradorEscalaModel> {
    return this.http.get<GeradorEscalaModel>(`${this.apiUrl}/atual`).pipe(
      tap((dado) => {
        this.buscarEscalaSignal.set(dado);
      }),
      catchError((error) => throwError(() => error)),
    );
  }
}
