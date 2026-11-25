import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';

import { RequestHttp } from '../constants/requests.const';
import {
  CompetenciaSetorialContadorSupModel,
  CompetenciaSetorialModel,
  CompetenciaSetorialQuery,
  CompetenciaSetorialTagsModel,
} from '../entities/competencia-setorial.model';
import { buildCompetenciaSetorialParams } from './competencia-setorial.params';

@Injectable({
  providedIn: 'root',
})
export class CompetenciaSetorialService {
  private http = inject(HttpClient);
  private apiUrl = RequestHttp.competencia_setorial;

  private listarCompetenciaSetorialSignal = signal<CompetenciaSetorialTagsModel[] | null>(null);
  public listarCompetenciaSetorial = this.listarCompetenciaSetorialSignal.asReadonly();

  private contadorCompSetSupSignal = signal<CompetenciaSetorialContadorSupModel | null>(null);
  public contadorCompetenciaSetorialSupervisor = this.contadorCompSetSupSignal.asReadonly();

  // Retorna a lista de tags para o select
  listarCompetencia(query: CompetenciaSetorialQuery): Observable<CompetenciaSetorialTagsModel[]> {
    return this.http
      .get<
        CompetenciaSetorialTagsModel[]
      >(`${this.apiUrl}/list_tags?${buildCompetenciaSetorialParams(query)}`)
      .pipe(
        tap((dados) => {
          console.log(dados);
          this.listarCompetenciaSetorialSignal.set(dados);
        }),
        catchError((error) => throwError(() => error)),
      );
  }

  contadorGestor(): Observable<CompetenciaSetorialContadorSupModel> {
    return this.http
      .get<CompetenciaSetorialContadorSupModel>(`${this.apiUrl}/counter_manager`)
      .pipe(
        tap((dado) => this.contadorCompSetSupSignal.set(dado)),
        catchError((error) => throwError(() => error)),
      );
  }

  public limparContadorGestor() {
    this.contadorCompSetSupSignal.set(null);
  }

  public limparListaCompetenciaSetorial() {
    this.listarCompetenciaSetorialSignal.set(null);
  }
}
