import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, throwError } from 'rxjs';

import { CompetenciaSetorialService } from '../../../services/competencia-setorial.service';
import { CompetenciaSetorialTagsModel } from '../../../entities/competencia-setorial.model';
import { EscopoSolicitacoesService } from './solicitacoes-escopo.service';
import { TagAtivoDisponivel } from './solicitacao.model';

@Injectable({ providedIn: 'root' })
export class TagsAtivoService {
  private readonly competencias = inject(CompetenciaSetorialService);
  private readonly escopo = inject(EscopoSolicitacoesService);

  private readonly carregandoSignal = signal(false);
  private readonly falhaSignal = signal(false);

  readonly carregando = this.carregandoSignal.asReadonly();
  readonly falhou = this.falhaSignal.asReadonly();

  readonly tags = computed<TagAtivoDisponivel[]>(() =>
    this.deduplicar(
      (this.competencias.listarCompetenciaSetorial() ?? []).map((tag) => this.mapear(tag)),
    ),
  );

  readonly tagUnica = computed(() => this.tags().length === 1);

  readonly porId = computed(() => new Map(this.tags().map((tag) => [tag.id, tag] as const)));

  listar(forcar = false): Observable<TagAtivoDisponivel[]> {
    const colaboradorId = this.escopo.solicitanteId();

    if (!colaboradorId) {
      this.falhaSignal.set(true);
      return throwError(() => ({ message: 'Colaborador não identificado na sessão.' }));
    }

    if (!forcar && this.competencias.listarCompetenciaSetorial()) {
      return of(this.tags());
    }

    this.carregandoSignal.set(true);
    this.falhaSignal.set(false);

    return this.competencias.listarCompetencia({ colaboradorId, status: true, gestor: true }).pipe(
      catchError((erro) => {
        console.error('[TagsAtivoService] falha ao listar tags', erro);
        this.falhaSignal.set(true);
        return throwError(() => erro);
      }),
      finalize(() => this.carregandoSignal.set(false)),
      map(() => this.tags()),
    );
  }

  limparCache(): void {
    this.carregandoSignal.set(false);
    this.falhaSignal.set(false);
    this.competencias.limparListaCompetenciaSetorial();
  }

  private mapear(tag: CompetenciaSetorialTagsModel): TagAtivoDisponivel {
    return {
      id: tag.id,
      codigo: tag.codigo != null ? String(tag.codigo) : null,
      descricao: tag.descricao ?? null,
      ativoDescricao: tag.desAtivo ?? null,
    };
  }

  private deduplicar(tags: TagAtivoDisponivel[]): TagAtivoDisponivel[] {
    const vistos = new Set<string>();
    return tags.filter((tag) => {
      if (vistos.has(tag.id)) return false;
      vistos.add(tag.id);
      return true;
    });
  }
}
