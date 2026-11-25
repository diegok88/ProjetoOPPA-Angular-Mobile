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
  LinhaHistorico,
  StatusSolicitacao,
  RecorteHistorico,
  OPCOES_SITUACAO,
  OPCOES_RECORTE,
  FiltroHistorico,
  FILTRO_HISTORICO_INICIAL,
  TAMANHO_MAXIMO_PAGINA,
} from '../anexos/solicitacao.model';
import { dataHoje } from '../anexos/solicitacoes-params';

type AcaoResposta = 'ACEITAR' | 'RECUSAR';

const OBSERVACAO_MAX = 500;

@Component({
  selector: 'app-solicitacoes-recebidas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconesSvg, SolicitacaoCard],
  templateUrl: './solicitacoes-recebidas.html',
  styleUrl: './solicitacoes-recebidas.scss',
})
export class SolicitacoesRecebidas implements OnInit {
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

  protected respondendo = signal<LinhaHistorico | null>(null);
  protected acao = signal<AcaoResposta>('ACEITAR');
  protected observacao = signal('');
  protected processandoId = signal<string | null>(null);

  protected readonly situacoes = OPCOES_SITUACAO;
  protected readonly recortes = OPCOES_RECORTE;
  protected readonly hoje = dataHoje();
  protected readonly limiteObservacao = OBSERVACAO_MAX;

  protected totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.tamanho())));

  protected temFiltro = computed(() => !!this.situacao() || !!this.desvios());

  protected tituloModal = computed(() =>
    this.acao() === 'ACEITAR' ? 'Aceitar solicitação' : 'Recusar solicitação',
  );

  private readonly alteracao$ = new Subject<void>();
  /** Evita remarcar o mesmo id a cada recarga da mesma página. */
  private readonly marcados = new Set<string>();

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
    this.marcados.clear();
    this.consultar(true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  protected irPara(delta: number): void {
    const destino = this.pagina() + delta;
    if (destino < 1 || destino > this.totalPaginas()) return;
    this.pagina.set(destino);
    this.consultar(true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  protected abrirResposta(linha: LinhaHistorico, acao: AcaoResposta): void {
    this.respondendo.set(linha);
    this.acao.set(acao);
    this.observacao.set('');
  }

  protected fecharResposta(): void {
    this.respondendo.set(null);
    this.observacao.set('');
  }

  protected aoDigitarObservacao(valor: string): void {
    this.observacao.set(valor.slice(0, OBSERVACAO_MAX));
  }

  protected confirmarResposta(): void {
    const alvo = this.respondendo();
    if (!alvo) return;

    const solicitadoId = this.escopo.solicitadoId();
    if (!solicitadoId) {
      this.erro.set('Não foi possível identificar o usuário responsável pela resposta.');
      return;
    }

    this.processandoId.set(alvo.id);
    const observacao = this.observacao().trim();

    this.service
      .responder({
        id: alvo.id,
        acao: this.acao(),
        solicitadoId,
        observacao: observacao || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.processandoId.set(null);
          this.fecharResposta();
          this.consultar(true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
        },
        error: () => {
          this.processandoId.set(null);
          this.fecharResposta();
          this.erro.set('Não foi possível registrar a resposta. Tente novamente.');
        },
      });
  }

  private montarFiltro(): FiltroHistorico {
    const solicitadoId = this.escopo.solicitadoId() ?? '';

    return {
      ...FILTRO_HISTORICO_INICIAL,
      caixa: 'recebidas',
      desvios: this.desvios(),
      situacao: this.situacao(),
      situacoes: this.situacao() ? [this.situacao() as StatusSolicitacao] : [],
      solicitadoId,
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
          const dados = resposta?.dados ?? [];
          this.linhas.set(dados);
          this.total.set(resposta?.total ?? 0);
          this.carregando.set(false);
          this.atualizando.set(false);
          this.marcarComoLidas(dados);
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

  private marcarComoLidas(dados: LinhaHistorico[]): void {
    const pendentesSemLeitura = dados.filter(
      (linha) =>
        linha.situacao === 'PENDENTE' && !linha.dataVisualizacao && !this.marcados.has(linha.id),
    );

    if (!pendentesSemLeitura.length) return;

    const ids = pendentesSemLeitura.map((linha) => linha.id);
    ids.forEach((id) => this.marcados.add(id));

    const agora = new Date().toISOString();

    this.service
      .marcarVisualizada(ids, this.escopo.solicitadoId() ?? undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.linhas.update((atuais) =>
            atuais.map((linha) =>
              ids.includes(linha.id) ? { ...linha, dataVisualizacao: agora } : linha,
            ),
          );
        },
        error: () => ids.forEach((id) => this.marcados.delete(id)),
      });
  }
}
