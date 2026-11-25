import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { IconesSvg } from '../../icones/icones-svg';
import { LinhaHistorico, ROTULO_SITUACAO } from '../anexos/solicitacao.model';

export type ModoSolicitacao = 'enviadas' | 'recebidas';

@Component({
  selector: 'app-solicitacao-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, IconesSvg],
  templateUrl: './solicitacao-card.html',
  styleUrl: './solicitacao-card.scss',
})
export class SolicitacaoCard {
  public linha = input.required<LinhaHistorico>();
  public modo = input.required<ModoSolicitacao>();
  public ocupado = input(false);

  public cancelar = output<LinhaHistorico>();
  public aceitar = output<LinhaHistorico>();
  public recusar = output<LinhaHistorico>();

  protected pendente = computed(() => this.linha().situacao === 'PENDENTE');

  protected rotulo = computed(
    () => ROTULO_SITUACAO[this.linha().situacao] ?? this.linha().situacao,
  );

  protected titulo = computed(() => this.linha().tipoSolicitacao?.descricao ?? 'Solicitação');

  protected pessoa = computed(() => {
    const linha = this.linha();
    const alvo = this.modo() === 'recebidas' ? linha.solicitante : linha.solicitado;
    return alvo?.nome ?? 'Não informado';
  });

  protected cracha = computed(() => {
    const linha = this.linha();
    const alvo = this.modo() === 'recebidas' ? linha.solicitante : linha.solicitado;
    return alvo?.cracha ?? null;
  });

  protected ativo = computed(() => this.linha().tagAtivo?.descricao ?? null);

  /** Marca de leitura: só faz sentido em recebidas. */
  protected lida = computed(() => this.modo() === 'recebidas' && !!this.linha().dataVisualizacao);

  protected visualizadaEm = computed(() => this.linha().dataVisualizacao ?? null);

  protected podeCancelar = computed(() => this.modo() === 'enviadas' && this.pendente());

  protected podeResponder = computed(() => this.modo() === 'recebidas' && this.pendente());
}
