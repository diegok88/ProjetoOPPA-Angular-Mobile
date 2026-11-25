import { NgClass } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { AlocacaoOperacionalService } from '../../services/alocacao-operacional.service';
import {
  CLASSE_CONDICAO,
  CLASSE_SITUACAO,
  CondicaoAlocacao,
  CondicaoAlocacaoType,
  ContadorAlocacao,
  FiltroAlocacao,
  FiltroAlocacaoType,
  SituacaoAlocacao,
  SituacaoAlocacaoType,
} from '../../entities/alocacao-operacional.model';

type Visao = 'inicial' | 'lista' | 'detalhe';

interface CartaoResumo {
  chave: keyof ContadorAlocacao;
  titulo: string;
  icone: string;
  filtro: FiltroAlocacaoType;
}

const CARTOES: CartaoResumo[] = [
  { chave: 'total', titulo: 'Total', icone: 'list_alt', filtro: FiltroAlocacao.TOTAIS.valor },
  {
    chave: 'disponivel',
    titulo: 'Disponível',
    icone: 'pending',
    filtro: FiltroAlocacao.DISPONIVEL.valor,
  },
  { chave: 'aceito', titulo: 'Aceito', icone: 'sunny', filtro: FiltroAlocacao.ACEITO.valor },
  { chave: 'alocado', titulo: 'Alocado', icone: 'verified', filtro: FiltroAlocacao.ALOCADO.valor },
  {
    chave: 'aguardando',
    titulo: 'Aguardando',
    icone: 'schedule',
    filtro: FiltroAlocacao.AGUARDANDO.valor,
  },
  {
    chave: 'indisponivel',
    titulo: 'Indisponível',
    icone: 'sync',
    filtro: FiltroAlocacao.INDISPONIVEL.valor,
  },
  {
    chave: 'recusado',
    titulo: 'Recusado',
    icone: 'clinical_notes',
    filtro: FiltroAlocacao.RECUSADO.valor,
  },
  {
    chave: 'finalizado',
    titulo: 'Finalizado',
    icone: 'release_alert',
    filtro: FiltroAlocacao.FINALIZADO.valor,
  },
];

const VALORES_CONDICAO = new Set<string>(Object.values(CondicaoAlocacao).map((c) => c.valor));
const VALORES_SITUACAO = new Set<string>(Object.values(SituacaoAlocacao).map((s) => s.valor));
const TAMANHO_PAGINA_PADRAO = 10;

@Component({
  selector: 'app-alocacao-operacional',
  imports: [NgClass, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './alocacao-operacional.html',
  styleUrl: './alocacao-operacional.scss',
})
export class AlocacaoOperacional implements OnInit, OnDestroy {
  private alocOperService = inject(AlocacaoOperacionalService);

  protected readonly cartoes = CARTOES;
  protected readonly contador = this.alocOperService.contadorAlocacaoOeracional;
  protected readonly resultado = this.alocOperService.filtrarAlocacaoOperacional;
  protected readonly detalhe = this.alocOperService.buscarAlocacaoOperacional;

  protected readonly visao = signal<Visao>('inicial');
  protected readonly filtro = signal<FiltroAlocacaoType>(FiltroAlocacao.TOTAIS.valor);
  protected readonly carregando = signal<boolean>(false);

  protected readonly totalPaginas = computed(() => {
    const { total, tamanho } = this.resultado();
    return Math.max(1, Math.ceil(total / (tamanho || TAMANHO_PAGINA_PADRAO)));
  });

  protected readonly temPaginaAnterior = computed(() => this.resultado().pagina > 1);
  protected readonly temProximaPagina = computed(
    () => this.resultado().pagina < this.totalPaginas(),
  );

  protected readonly tituloFiltro = computed(
    () => Object.values(FiltroAlocacao).find((item) => item.valor === this.filtro())?.label ?? '',
  );

  ngOnInit(): void {
    this.carregarContador();
  }

  ngOnDestroy(): void {
    this.alocOperService.limparTodos();
  }

  protected abrirFiltro(filtro: FiltroAlocacaoType): void {
    this.filtro.set(filtro);
    this.visao.set('lista');
    void this.carregarPagina(1);
  }

  protected irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    void this.carregarPagina(pagina);
  }

  protected async abrirDetalhe(id: string): Promise<void> {
    if (!id) return;

    this.visao.set('detalhe');
    this.carregando.set(true);
    this.alocOperService.limparBuscar();

    await firstValueFrom(this.alocOperService.buscar(id)).catch((erro) =>
      console.error('Erro ao buscar alocação:', erro),
    );

    this.carregando.set(false);
  }

  protected voltar(): void {
    if (this.visao() === 'detalhe') {
      this.alocOperService.limparBuscar();
      this.visao.set('lista');
      return;
    }

    this.visao.set('inicial');
    this.carregarContador();
  }

  protected valorCartao(cartao: CartaoResumo) {
    return this.contador()?.[cartao.chave] ?? 0;
  }

  protected classeCondicao(condicao?: CondicaoAlocacaoType | null): string {
    return condicao ? CLASSE_CONDICAO[condicao] : 'badge-neutro';
  }

  protected classeSituacao(situacao?: SituacaoAlocacaoType | null): string {
    return situacao ? CLASSE_SITUACAO[situacao] : 'badge-neutro';
  }

  protected exibirCondicao(condicao?: CondicaoAlocacaoType | null): string {
    if (!condicao) return '-';
    return (
      Object.values(CondicaoAlocacao).find((item) => item.valor === condicao)?.label ?? condicao
    );
  }

  protected exibirSituacao(situacao?: SituacaoAlocacaoType | null): string {
    if (!situacao) return '-';
    return (
      Object.values(SituacaoAlocacao).find((item) => item.valor === situacao)?.label ?? situacao
    );
  }

  private carregarContador(): void {
    this.alocOperService.counter(`gestor=${true}`).subscribe();
  }

  private async carregarPagina(pagina: number): Promise<void> {
    this.carregando.set(true);

    try {
      await firstValueFrom(this.alocOperService.listarFiltro(this.transformarQuery(pagina)));
    } catch (erro) {
      console.error('Erro ao listar alocações:', erro);
    } finally {
      this.carregando.set(false);
    }
  }

  private transformarQuery(pagina: number): string {
    const params = new URLSearchParams({
      gestor: 'true',
      ordenacao: 'filtrar',
      page: String(pagina),
      size: String(this.resultado().tamanho || TAMANHO_PAGINA_PADRAO),
    });

    const filtro = this.filtro();

    if (VALORES_CONDICAO.has(filtro)) {
      params.set('condicao', filtro);
    } else if (VALORES_SITUACAO.has(filtro)) {
      params.set('situacao', filtro);
    }

    return params.toString();
  }
}
