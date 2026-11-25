import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

import { GeradorEscalaService } from '../../services/gerador-escala.service';
import { PerfilService } from '../../services/perfil.service';
import { CompetenciaSetorialService } from '../../services/competencia-setorial.service';
import { GestorService } from '../../services/gestor.service';
import { AlocacaoOperacionalService } from '../../services/alocacao-operacional.service';

@Component({
  selector: 'app-principal',
  imports: [MatIconModule],
  templateUrl: './principal.html',
  styleUrl: './principal.scss',
})
export class Principal implements OnInit {
  private authService = inject(AuthService);
  protected readonly usuario = this.authService.usuario;

  protected perfilService = inject(PerfilService);
  protected perfil = this.perfilService.buscarPerfil;

  private data = new Date();

  /* Estrutura de retorno de escala atual */
  private geradorEscalaService = inject(GeradorEscalaService);
  protected readonly escalaAtual = this.geradorEscalaService.buscarEscala;
  private carregarEscala() {
    return this.geradorEscalaService.buscar();
  }

  /* Estrutura de retorno de mês atual */
  protected mesAtual = this.data.toLocaleString('pt-BR', { month: 'long' }).toUpperCase();

  /* Estrutura de retorno de experiência */
  protected experiencia = computed(() => this.calcularExperiencia(this.usuario()?.dataAdmissao));

  private calcularExperiencia(admissao: unknown, hoje: Date = new Date()): string {
    const dataAdmissao = this.converterData(admissao);
    if (!dataAdmissao) return '—';
    if (dataAdmissao > hoje) return 'Ainda não admitido';
    let anos = hoje.getFullYear() - dataAdmissao.getFullYear();
    let meses = hoje.getMonth() - dataAdmissao.getMonth();
    if (hoje.getDate() < dataAdmissao.getDate()) meses--;
    if (meses < 0) {
      anos--;
      meses += 12;
    }
    const dias = Math.floor((hoje.getTime() - dataAdmissao.getTime()) / 86_400_000);
    return this.formatarTempo(anos, meses, dias);
  }

  private formatarTempo(anos: number, meses: number, dias: number): string {
    const plural = (n: number, singular: string, plural: string) =>
      `${n} ${n === 1 ? singular : plural}`;
    if (anos > 0 && meses > 0) {
      return `${plural(anos, 'ano', 'anos')} e ${plural(meses, 'mês', 'meses')}`;
    }
    if (anos > 0) return plural(anos, 'ano', 'anos');
    if (meses > 0) return plural(meses, 'mês', 'meses');
    return plural(dias, 'dia', 'dias');
  }

  private converterData(valor: unknown): Date | null {
    if (!valor) return null;
    if (valor instanceof Date) {
      return isNaN(valor.getTime()) ? null : valor;
    }
    if (typeof valor === 'string') {
      const iso = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (iso) {
        return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
      }
      const br = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
      if (br) {
        return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));
      }
    }
    return null;
  }

  /* Estrutura de retorno de contagem de competência setorial */
  private compSetService = inject(CompetenciaSetorialService);
  protected readonly contadorCompSet = this.compSetService.contadorCompetenciaSetorialSupervisor;
  private carregarCompSet() {
    return this.compSetService.contadorGestor();
  }

  /* Estrutura de retorno de contagem de quadro de colaboradores */
  private gestorService = inject(GestorService);
  protected readonly contadorColaborador = this.gestorService.contadorGestorManager;
  private carregarColaboradores() {
    return this.gestorService.counterManager();
  }

  /* Estrutura de retorno de contagem de quadro de ativos */
  private alocOperService = inject(AlocacaoOperacionalService);
  protected readonly contadorAtivos = this.alocOperService.contadorAlocacaoOeracional;
  protected totalAtivos = signal<number>(0);
  private carregarAtivos() {
    const query = `gestor=${true}`;
    return this.alocOperService.counter(query);
  }
  private carregarTotalAtivos() {
    const total =
      this.contadorAtivos()?.alocado! +
      this.contadorAtivos()?.disponivel! +
      this.contadorAtivos()?.indisponivel!;
    this.totalAtivos.set(total);
  }

  ngOnInit(): void {
    this.carregarEscala().subscribe();
    this.carregarCompSet().subscribe();
    this.carregarColaboradores().subscribe();
    this.carregarAtivos().subscribe({ next: () => this.carregarTotalAtivos() });
  }
}
