import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { RequestHttp } from '../constants/requests.const';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ContadorManager } from '../entities/gestor.model';

@Injectable({
  providedIn: 'root',
})
export class GestorService {
  private http = inject(HttpClient);
  private apiUrl = RequestHttp.gestor;

  private contadorGestorManagerSignal = signal<ContadorManager | null>(null);
  public contadorGestorManager = this.contadorGestorManagerSignal.asReadonly();

  /* CONTADOR DE REGISTROS TOTAIS, PENALIDADES E DISPENSAS */
  counterManager(): Observable<ContadorManager> {
    return this.http.get<ContadorManager>(`${this.apiUrl}/counter_manager`).pipe(
      tap((dado) => {
        console.log(dado);
        this.contadorGestorManagerSignal.set(dado);
      }),
      catchError((error) => throwError(() => error)),
    );
  }

  /* LIMPEZA DOS SIGNALS DE LISTAR E BUSCAR */
  public limparBuscar() {
    this.contadorGestorManagerSignal.set(null);
  }
}
