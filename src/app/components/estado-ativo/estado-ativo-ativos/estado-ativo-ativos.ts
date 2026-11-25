import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AtivosSetorService } from '../anexos/ativos-setor.service';
import { EstadoAtivoListagemModel } from '../anexos/estado-ativo.model';
import { CardEstadoAtivoComponent } from '../card-estado/card-estado-ativo';
import { rotaSetores } from '../anexos/estado-ativo.routes';

@Component({
  selector: 'app-estado-ativo-ativos',
  standalone: true,
  imports: [CardEstadoAtivoComponent],
  templateUrl: './estado-ativo-ativos.html',
  styleUrl: './estado-ativo-ativos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadoAtivoAtivos implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(AtivosSetorService);

  private readonly setorIdSignal = signal('');

  readonly setorId = this.setorIdSignal.asReadonly();
  readonly nomeSetor = signal('Setor');
  readonly ativos = this.service.ativosOrdenados;
  readonly resumo = this.service.resumo;
  readonly carregando = this.service.carregando;
  readonly conectado = this.service.isConectado;
  readonly vazio = this.service.vazio;

  ngOnInit(): void {
    const setorId = this.route.snapshot.paramMap.get('setorId') ?? '';
    const nome = this.route.snapshot.queryParamMap.get('nome');

    this.setorIdSignal.set(setorId);
    this.nomeSetor.set(nome || 'Setor selecionado');

    this.service.entrarNoSetor(setorId);
  }

  ngOnDestroy(): void {
    this.service.sairDoSetor();
  }

  voltar(): void {
    this.router.navigate(rotaSetores());
  }

  atualizar(): void {
    this.service.recarregar();
  }

  tempo(estado: EstadoAtivoListagemModel): number {
    return this.service.tempoDecorrido(estado);
  }

  /**
   * Não existe rota de detalhe da tag em app.routes.ts.
   * Deixe o card apenas selecionável até criar 'estados-ativos/tag/:tagAtivoId'.
   * Para ativar: registre a rota e descomente a navegação abaixo.
   */
  abrirDetalhe(estado: EstadoAtivoListagemModel): void {
    console.debug('[EstadoAtivoAtivos] tag selecionada:', estado.tagAtivoId);
    // this.router.navigate([
    //   ...rotaSetores(),
    //   'tag',
    //   estado.tagAtivoId,
    // ]);
  }

  readonly aviso = this.service.aviso;

  fecharAviso(): void {
    this.service.fecharAviso();
  }
}
