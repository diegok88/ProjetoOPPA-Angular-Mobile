import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, of, tap } from 'rxjs';
import { environment } from '../../../constants/environment.const';
import { SetorCompetenciaModel } from './estado-ativo.model';

@Injectable({ providedIn: 'root' })
export class CompetenciaSetorialGestorService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/competencia-setorial`;

  private readonly setoresSignal = signal<SetorCompetenciaModel[]>([]);
  private readonly carregandoSignal = signal(false);
  private readonly erroSignal = signal<string | null>(null);

  readonly setores = this.setoresSignal.asReadonly();
  readonly carregando = this.carregandoSignal.asReadonly();
  readonly erro = this.erroSignal.asReadonly();
  readonly totalSetores = computed(() => this.setoresSignal().length);
  readonly vazio = computed(() => !this.carregandoSignal() && this.setoresSignal().length === 0);

  listarDoGestor(): Observable<SetorCompetenciaModel[]> {
    this.carregandoSignal.set(true);
    this.erroSignal.set(null);

    return this.http.get<SetorCompetenciaModel[]>(`${this.base}/setores-gestor`).pipe(
      tap((setores) => this.setoresSignal.set(setores ?? [])),
      catchError((err) => {
        console.error('[CompetenciaSetorial] falha ao listar setores', err);
        this.erroSignal.set('Não foi possível carregar seus setores.');
        this.setoresSignal.set([]);
        return of([]);
      }),
      finalize(() => this.carregandoSignal.set(false)),
    );
  }

  limpar(): void {
    this.setoresSignal.set([]);
    this.erroSignal.set(null);
  }
}
