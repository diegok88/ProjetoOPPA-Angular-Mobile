import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { RequestHttp } from '../constants/requests.const';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { CompetenciaOperacionalModel } from '../entities/competencia-operacional.model';
import { AtivosModel } from '../entities/ativos.model';
import { Contador } from '../interfaces/counter.interface';

@Injectable({
  providedIn: 'root',
})
export class CompetenciaOperacionalService {
  private http = inject(HttpClient);
  private apiUrl = RequestHttp.competencia_operacional;

  private listarCompetenciasSignal = signal<CompetenciaOperacionalModel[] | []>([]);
  public listarCompetencias = this.listarCompetenciasSignal.asReadonly();

  private listarAtivosSignal = signal<AtivosModel[] | []>([]);
  public listarAtivos = this.listarAtivosSignal.asReadonly();

  private buscarCompetenciaSignal = signal<CompetenciaOperacionalModel | null>(null);
  public buscarCompetencia = this.buscarCompetenciaSignal.asReadonly();

  private contadorCompetenciasSignal = signal<Contador | null>(null);
  public contadorCompetencias = this.contadorCompetenciasSignal.asReadonly();

  listar(query?: string): Observable<CompetenciaOperacionalModel[]> {
    return this.http.get<CompetenciaOperacionalModel[]>(`${this.apiUrl}?${query}`).pipe(
      tap((dados) => {
        this.listarCompetenciasSignal.set(dados);
      }),
      catchError((error) => throwError(() => error)),
    );
  }
  listarAtivosDesalocados(operadorId: string): Observable<AtivosModel[]> {
    return this.http.get<AtivosModel[]>(`${this.apiUrl}/assets?operadorId=${operadorId}`).pipe(
      tap((dado) => {
        console.log(dado);
        this.listarAtivosSignal.set(dado);
      }),
      catchError((error) => throwError(() => error)),
    );
  }
  buscar(id: string): Observable<CompetenciaOperacionalModel> {
    return this.http.get<CompetenciaOperacionalModel>(`${this.apiUrl}/${id}`).pipe(
      tap((dado) => {
        this.buscarCompetenciaSignal.set(dado);
      }),
      catchError((error) => throwError(() => error)),
    );
  }
  counter(query?: string): Observable<Contador> {
    return this.http.get<Contador>(`${this.apiUrl}/counter?${query}`).pipe(
      tap((dado) => {
        this.contadorCompetenciasSignal.set(dado);
      }),
      catchError((error) => throwError(() => error)),
    );
  }
  limparBuscar() {
    this.buscarCompetenciaSignal.set(null);
    this.listarCompetenciasSignal.set([]);
    this.listarAtivosSignal.set([]);
    this.contadorCompetenciasSignal.set(null);
  }
}
