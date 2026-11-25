import { inject, Injectable, signal } from '@angular/core';
import { RequestHttp } from '../constants/requests.const';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import {
  AlocacaoOperacionalModel,
  AlocacaoOperacionalSolicitacaoQuery,
  ContadorAlocacao,
} from '../entities/alocacao-operacional.model';
import { PaginatedResponse } from '../interfaces/paginator.interface';
import { buildAlocacaoOperacionalParams } from './alocacao-operacional.params';

@Injectable({
  providedIn: 'root',
})
export class AlocacaoOperacionalService {
  private http = inject(HttpClient);
  private apiUrl = RequestHttp.alocacao_operacional;

  private filtrarAlocOperSignal = signal<PaginatedResponse<AlocacaoOperacionalModel>>({
    dados: [],
    total: 0,
    pagina: 1,
    tamanho: 10,
  });
  readonly filtrarAlocacaoOperacional = this.filtrarAlocOperSignal.asReadonly();

  private buscarAlocOperSignal = signal<AlocacaoOperacionalModel | null>(null);
  public buscarAlocacaoOperacional = this.buscarAlocOperSignal.asReadonly();

  private contadorAlocOperSignal = signal<ContadorAlocacao | null>(null);
  public contadorAlocacaoOeracional = this.contadorAlocOperSignal.asReadonly();

  listarFiltro(query = ''): Observable<PaginatedResponse<AlocacaoOperacionalModel>> {
    const url = query ? `${this.apiUrl}?${query}` : this.apiUrl;

    return this.http
      .get<PaginatedResponse<AlocacaoOperacionalModel>>(url)
      .pipe(tap((res) => this.filtrarAlocOperSignal.set(res)));
  }

  buscar(id: string): Observable<AlocacaoOperacionalModel> {
    return this.http.get<AlocacaoOperacionalModel>(`${this.apiUrl}/${id}`).pipe(
      tap((dado) => {
        this.buscarAlocOperSignal.set(dado);
      }),
      catchError((error) => throwError(() => error)),
    );
  }

  buscarOperadorSolicitacao(
    query: AlocacaoOperacionalSolicitacaoQuery,
  ): Observable<AlocacaoOperacionalModel> {
    return this.http
      .get<AlocacaoOperacionalModel>(
        `${this.apiUrl}/solicitacao?${buildAlocacaoOperacionalParams(query)}`,
      )
      .pipe(
        tap((dado) => {
          this.buscarAlocOperSignal.set(dado);
        }),
        catchError((error) => throwError(() => error)),
      );
  }

  counter(query?: string): Observable<ContadorAlocacao> {
    return this.http.get<ContadorAlocacao>(`${this.apiUrl}/counter?${query}`).pipe(
      tap((dado) => {
        this.contadorAlocOperSignal.set(dado);
      }),
      catchError((error) => throwError(() => error)),
    );
  }

  public limparTodos() {
    this.limparContador();
  }
  public limparBuscar() {
    this.contadorAlocOperSignal.set(null);
  }
  public limparContador() {
    this.contadorAlocOperSignal.set(null);
  }
}
