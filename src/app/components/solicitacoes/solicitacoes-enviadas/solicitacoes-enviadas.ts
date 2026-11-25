import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, catchError, debounceTime, map, of, switchMap, tap } from 'rxjs';

import { IconesSvg } from '../../icones/icones-svg';
import { SolicitacaoCard } from '../solicitacoes-cards/solicitacao-card';

import { SolicitacaoService } from '../anexos/solicitacoes.service';
import { EscopoSolicitacoesService } from '../anexos/solicitacoes-escopo.service';
import {
  FILTRO_HISTORICO_INICIAL,
  FiltroHistorico,
  LinhaHistorico,
  OPCOES_RECORTE,
  OPCOES_SITUACAO,
  RecorteHistorico,
  StatusSolicitacao,
  TAMANHO_MAXIMO_PAGINA,
} from '../anexos/solicitacao.model';
import { dataHoje } from '../anexos/solicitacoes-params';

@Component({
  selector: 'app-solicitacoes-enviadas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconesSvg, SolicitacaoCard],
  templateUrl: './solicitacoes-enviadas.html',
  styleUrl: './solicitacoes-enviadas.scss',
})
export class SolicitacoesEnviadas implements OnInit {
  private readonly service = inject(SolicitacaoService);
  private readonly escopo = inject(EscopoSolicitacoesService);
  private readonly destroyRef = inject(DestroyRef);

  protected linhas = signal<LinhaHistorico[]>([]);
  protected total = signal(0);
  protected pagina = signal(1);
  protected tamanho = signal(10);
  protected carregando = signal(false);
  protected atualizando = signal(false);
  protected erro = signal<string | null>(null);

  protected situacao = signal<StatusSolicitacao | ''>('');
  protected desvios = signal<RecorteHistorico>('');

  protected confirmando = signal<LinhaHistorico | null>(null);
  protected processandoId = signal<string | null>(null);

  protected readonly situacoes = OPCOES_SITUACAO;
  protected readonly recortes = OPCOES_RECORTE;
  protected readonly hoje = dataHoje();

  protected totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.tamanho())));

  protected temFiltro = computed(() => !!this.situacao() || !!this.desvios());

  private readonly alteracao$ = new Subject<void>();

  ngOnInit(): void {
    this.service.conectar();

    this.alteracao$
      .pipe(
        debounceTime(300),
        switchMap(() => {
          this.pagina.set(1);
          return this.consultar(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    this.consultar(false).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  protected aoFiltrarSituacao(valor: string): void {
    this.situacao.set(valor as StatusSolicitacao | '');
    this.alteracao$.next();
  }

  protected aoFiltrarRecorte(valor: string): void {
    this.desvios.set(valor as RecorteHistorico);
    this.alteracao$.next();
  }

  protected limpar(): void {
    this.situacao.set('');
    this.desvios.set('');
    this.pagina.set(1);
    this.consultar(false).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  protected atualizar(): void {
    this.consultar(true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  protected irPara(delta: number): void {
    const destino = this.pagina() + delta;
    if (destino < 1 || destino > this.totalPaginas()) return;
    this.pagina.set(destino);
    this.consultar(true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  protected pedirCancelamento(linha: LinhaHistorico): void {
    this.confirmando.set(linha);
  }

  protected fecharConfirmacao(): void {
    this.confirmando.set(null);
  }

  protected confirmarCancelamento(): void {
    const alvo = this.confirmando();
    if (!alvo) return;

    const solicitanteId = this.escopo.solicitanteId();
    if (!solicitanteId) {
      this.erro.set('Não foi possível identificar o usuário que enviou a solicitação.');
      return;
    }

    this.processandoId.set(alvo.id);
    this.service
      .cancelar(alvo.id, solicitanteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.processandoId.set(null);
          this.confirmando.set(null);
          this.consultar(true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
        },
        error: () => {
          this.processandoId.set(null);
          this.confirmando.set(null);
          this.erro.set('Não foi possível cancelar a solicitação.');
        },
      });
  }

  private montarFiltro(): FiltroHistorico {
    return {
      ...FILTRO_HISTORICO_INICIAL,
      caixa: 'enviadas',
      desvios: this.desvios(),
      situacao: this.situacao(),
      situacoes: this.situacao() ? [this.situacao() as StatusSolicitacao] : [],
      solicitanteId: this.escopo.solicitanteId() ?? '',
      tagAtivoId: this.escopo.tagAtivoId() ?? '',
      page: this.pagina(),
      size: Math.min(this.tamanho(), TAMANHO_MAXIMO_PAGINA),
    };
  }

  private consultar(manterLista: boolean): Observable<void> {
    if (manterLista) {
      this.atualizando.set(true);
    } else {
      this.carregando.set(true);
    }
    this.erro.set(null);

    return this.service.historico(this.montarFiltro()).pipe(
      tap({
        next: (resposta) => {
          this.linhas.set(resposta?.dados ?? []);
          this.total.set(resposta?.total ?? 0);
          this.carregando.set(false);
          this.atualizando.set(false);
        },
        error: () => {
          this.carregando.set(false);
          this.atualizando.set(false);
          this.erro.set('Falha ao carregar as solicitações de hoje.');
        },
      }),
      map(() => void 0),
      catchError(() => of(void 0)),
    );
  }
}
