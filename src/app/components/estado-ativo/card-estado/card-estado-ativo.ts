import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { EstadoAtivoListagemModel } from '../anexos/estado-ativo.model';
import { rotuloEstado, classeEstado, formatarTempo } from '../anexos/estado-ativo.util';

@Component({
  selector: 'app-card-estado-ativo',
  standalone: true,
  templateUrl: './card-estado-ativo.html',
  styleUrl: './card-estado-ativo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardEstadoAtivoComponent {
  readonly titulo = input<string>('Estado da Máquina');
  readonly subtitulo = input<string | null>(null);
  readonly estado = input<EstadoAtivoListagemModel | null>(null);
  readonly tempo = input<number>(0);
  readonly online = input<boolean>(true);

  readonly selecionado = output<EstadoAtivoListagemModel>();

  readonly tipoEstado = computed(() => this.estado()?.tipoEstado ?? '');
  readonly currentState = computed(() => rotuloEstado(this.tipoEstado()));
  readonly variante = computed(() => classeEstado(this.tipoEstado()));
  readonly duracao = computed(() => formatarTempo(this.tempo()));

  readonly stateSince = computed(() => {
    const data = this.estado()?.dataInicial;
    if (!data) return '--';
    const d = new Date(data);
    return isNaN(d.getTime()) ? '--' : d.toLocaleString('pt-BR');
  });

  abrir(): void {
    const atual = this.estado();
    if (atual) this.selecionado.emit(atual);
  }
}
