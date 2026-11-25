import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { asapScheduler, firstValueFrom, observeOn } from 'rxjs';

import { IconesSvg } from '../../icones/icones-svg';
import { EscopoSolicitacoesService } from '../anexos/solicitacoes-escopo.service';
import { SolicitacaoService } from '../anexos/solicitacoes.service';
import { TagsAtivoService } from '../anexos/tags-ativo.service';
import { TagAtivoDisponivel } from '../anexos/solicitacao.model';
import { AlocacaoOperacionalService } from '../../../services/alocacao-operacional.service';
import {
  AlocacaoOperacionalSolicitacaoQuery,
  SituacaoAlocacao,
} from '../../../entities/alocacao-operacional.model';

const OBSERVACAO_MAX = 1000;

@Component({
  selector: 'app-solicitacoes-escrever',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconesSvg],
  templateUrl: './solicitacoes-escrever.html',
  styleUrl: './solicitacoes-escrever.scss',
})
export class SolicitacoesEscrever implements OnInit {
  private readonly solicitacoes = inject(SolicitacaoService);
  private readonly tagsStore = inject(TagsAtivoService);
  private readonly alocacaoOperacionalService = inject(AlocacaoOperacionalService);
  private readonly escopo = inject(EscopoSolicitacoesService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  /* ---- estado vindo do store ---- */
  protected readonly tags = this.tagsStore.tags;
  protected readonly carregando = this.tagsStore.carregando;
  protected readonly falhou = this.tagsStore.falhou;
  protected readonly tagUnica = this.tagsStore.tagUnica;

  /* ---- estado local do formulário ---- */
  protected readonly tagId = signal('');
  protected readonly observacao = signal('');
  protected readonly tentouEnviar = signal(false);
  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly limiteObservacao = OBSERVACAO_MAX;

  protected readonly tagSelecionada = computed<TagAtivoDisponivel | null>(
    () => this.tagsStore.porId().get(this.tagId()) ?? null,
  );

  /** list_tags não devolve gestor: o destinatário vem só do escopo. */
  protected readonly gestorId = computed(() => this.escopo.solicitadoId());

  protected readonly tagInvalida = computed(() => this.tentouEnviar() && !this.tagId());

  protected readonly podeEnviar = computed(
    () =>
      !!this.tagSelecionada() &&
      !!this.escopo.solicitanteId() &&
      !!this.gestorId() &&
      !this.enviando(),
  );

  protected readonly rotuloBotao = computed(() => {
    if (this.enviando()) return 'Enviando...';
    if (this.carregando()) return 'Carregando ativos...';
    if (!this.tags().length) return 'Sem ativo alocado';
    return 'Enviar solicitação';
  });

  ngOnInit(): void {
    this.solicitacoes.conectar();
    this.carregar(false);
  }

  protected aoSelecionarTag(valor: string): void {
    this.tagId.set(valor);
    this.erro.set(null);
  }

  protected aoDigitarObservacao(valor: string): void {
    this.observacao.set(valor.slice(0, OBSERVACAO_MAX));
    this.erro.set(null);
  }

  protected recarregar(): void {
    this.tagsStore.limparCache();
    this.carregar(true);
  }

  /** "ATIVO X · Categoria Y", sem repetir texto que já coincide. */
  protected rotuloTag(tag: TagAtivoDisponivel): string {
    const partes = [tag.descricao, tag.ativoDescricao, tag.codigo ? `cód. ${tag.codigo}` : null];
    return this.juntar(partes, tag.id);
  }

  /** Apoio abaixo do select: detalha o ativo escolhido. */
  protected detalheTag(tag: TagAtivoDisponivel): string {
    const partes = [tag.ativoDescricao, tag.codigo ? `código ${tag.codigo}` : null];
    return this.juntar(partes, '');
  }

  protected async enviar(event: Event): Promise<void> {
    event.preventDefault();
    this.tentouEnviar.set(true);

    if (!this.podeEnviar()) {
      this.renderizar();
      return;
    }

    const tag = this.tagSelecionada();
    const solicitanteId = this.escopo.solicitanteId();

    const existente = await firstValueFrom(
      this.alocacaoOperacionalService.buscarOperadorSolicitacao({
        gestorId: solicitanteId!,
        tagAtivoId: tag?.id!,
        situacao: SituacaoAlocacao.ALOCADO.valor,
      }),
    );

    if (!tag || !solicitanteId || !existente.operadorId) {
      this.erro.set('Não foi possível identificar o solicitante ou o gestor da alocação.');
      this.renderizar();
      return;
    }

    const observacao = this.observacao().trim();

    this.enviando.set(true);
    this.erro.set(null);

    try {
      await firstValueFrom(
        this.solicitacoes.criar({
          solicitanteId: solicitanteId,
          solicitadoId: existente.operadorId,
          tagAtivoId: tag.id,
          observacao: observacao || undefined,
        }),
      );

      this.tagsStore.limparCache();
      await this.router.navigate(['/dashboard-user/solicitacoes-enviadas']);
    } catch {
      this.erro.set('Não foi possível enviar a solicitação.');
    } finally {
      this.enviando.set(false);
      this.renderizar();
    }
  }

  private carregarAlocacao(query: AlocacaoOperacionalSolicitacaoQuery) {
    return this.alocacaoOperacionalService.buscarOperadorSolicitacao(query);
  }

  /* ==================== INTERNO ==================== */

  private carregar(forcar: boolean): void {
    this.tagsStore
      .listar(forcar)
      .pipe(observeOn(asapScheduler), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tags) => {
          this.aplicarSelecaoPadrao(tags);
          this.renderizar();
        },
        error: () => {
          this.tagId.set('');
          this.renderizar();
        },
      });
  }

  private renderizar(): void {
    if (this.destroyRef.destroyed) return;
    this.cdr.detectChanges();
  }

  private aplicarSelecaoPadrao(tags: TagAtivoDisponivel[]): void {
    if (!tags.length) {
      this.tagId.set('');
      return;
    }

    if (tags.some((tag) => tag.id === this.tagId())) return;

    const doEscopo = this.escopo.tagAtivoId();
    const escolhida =
      tags.find((tag) => tag.id === doEscopo)?.id ?? (tags.length === 1 ? tags[0].id : '');

    this.tagId.set(escolhida);
  }

  private juntar(partes: (string | null | undefined)[], fallback: string): string {
    const limpas = partes
      .map((parte) => (parte ?? '').trim())
      .filter((parte): parte is string => parte.length > 0);

    const unicas = [...new Set(limpas)];
    return unicas.length ? unicas.join(' · ') : fallback;
  }
}
