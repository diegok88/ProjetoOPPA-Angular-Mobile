import { NgClass } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { Contador } from '../../interfaces/counter.interface';
import {
  FiltroCompetenciaOperacional,
  FiltroCompetenciaOperacionalType,
} from '../../entities/competencia-operacional.model';
import { CompetenciaOperacionalService } from '../../services/competencia-operacional.service';

type Visao = 'inicial' | 'lista' | 'detalhe';

interface CartaoResumo {
  chave: keyof Contador;
  titulo: string;
  icone: string;
  filtro: FiltroCompetenciaOperacionalType;
}

const CARTOES: CartaoResumo[] = [
  {
    chave: 'total',
    titulo: 'Total',
    icone: 'list_alt',
    filtro: FiltroCompetenciaOperacional.TOTAIS.valor,
  },
  {
    chave: 'ativos',
    titulo: 'Ativos',
    icone: 'verified',
    filtro: FiltroCompetenciaOperacional.ATIVOS.valor,
  },
  {
    chave: 'inativos',
    titulo: 'Inativos',
    icone: 'release_alert',
    filtro: FiltroCompetenciaOperacional.INATIVOS.valor,
  },
];

const TAMANHO_PAGINA_PADRAO = 10;

@Component({
  selector: 'app-competencia-operacional',
  imports: [NgClass, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './competencia-operacional.html',
  styleUrl: './competencia-operacional.scss',
})
export class CompetenciaOperacional implements OnInit, OnDestroy {
  private compOperService = inject(CompetenciaOperacionalService);

  protected readonly cartoes = CARTOES;
  protected readonly contador = this.compOperService.contadorCompetencias;
  protected readonly resultado = this.compOperService.listarCompetencias;

  protected readonly visao = signal<Visao>('inicial');
  protected readonly filtro = signal<FiltroCompetenciaOperacionalType>(
    FiltroCompetenciaOperacional.TOTAIS.valor,
  );
  protected readonly carregando = signal<boolean>(false);
  protected readonly selecionado = signal<any | null>(null);

  protected readonly tituloFiltro = computed(
    () =>
      Object.values(FiltroCompetenciaOperacional).find((item) => item.valor === this.filtro())
        ?.label ?? '',
  );

  ngOnInit(): void {
    this.carregarContador();
  }

  ngOnDestroy(): void {
    this.compOperService.limparBuscar();
  }

  protected abrirFiltro(filtro: FiltroCompetenciaOperacionalType): void {
    this.filtro.set(filtro);
    this.visao.set('lista');
    void this.carregarPagina(1);
  }

  protected abrirDetalhe(item: any): void {
    this.selecionado.set(item);
    this.visao.set('detalhe');
  }

  protected irParaPagina(pagina: number): void {
    const total = this.totalPaginas();
    if (pagina < 1 || pagina > total) return;
    void this.carregarPagina(pagina);
  }

  protected totalPaginas(): number {
    const { total, tamanho } = this.resultado() as any;
    return Math.max(1, Math.ceil((total ?? 0) / (tamanho || TAMANHO_PAGINA_PADRAO)));
  }

  protected temPaginaAnterior(): boolean {
    return ((this.resultado() as any).pagina ?? 1) > 1;
  }

  protected temProximaPagina(): boolean {
    return ((this.resultado() as any).pagina ?? 1) < this.totalPaginas();
  }

  protected voltar(): void {
    if (this.visao() === 'detalhe') {
      this.selecionado.set(null);
      this.visao.set('lista');
      return;
    }

    this.compOperService.limparBuscar();
    this.visao.set('inicial');
    this.carregarContador();
  }

  protected valorCartao(cartao: CartaoResumo): number {
    return (this.contador() as any)?.[cartao.chave] ?? 0;
  }

  protected classeStatus(status?: boolean | null): string {
    return status ? 'badge-ativo' : 'badge-inativo';
  }

  protected exibirStatus(status?: boolean | null): string {
    return status ? 'Ativo' : 'Inativo';
  }

  private carregarContador(): void {
    this.compOperService.counter(`gestor=${true}`).subscribe();
  }

  private async carregarPagina(pagina: number): Promise<void> {
    this.carregando.set(true);

    try {
      await firstValueFrom(this.compOperService.listar(this.transformarQuery(pagina)));
    } catch (erro) {
      console.error('Erro ao listar competências:', erro);
    } finally {
      this.carregando.set(false);
    }
  }

  private transformarQuery(pagina: number): string {
    const params = new URLSearchParams({
      gestor: 'true',
      incluir: 'todos_parcial',
      page: String(pagina),
      size: String((this.resultado() as any).tamanho || TAMANHO_PAGINA_PADRAO),
    });

    const filtro = this.filtro();

    if (filtro === FiltroCompetenciaOperacional.ATIVOS.valor) {
      params.set('status', 'true');
    } else if (filtro === FiltroCompetenciaOperacional.INATIVOS.valor) {
      params.set('status', 'false');
    }

    return params.toString();
  }
}
