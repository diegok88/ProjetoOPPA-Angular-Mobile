import { computed, inject, Injectable, NgZone, OnDestroy, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../constants/environment.const';
import { AuthService } from '../../../services/auth.service';
import {
  CronometroTick,
  EstadoAtivoListagemModel,
  EstadoTrocado,
  ResumoSetor,
} from './estado-ativo.model';
import { pesoEstado } from './estado-ativo.util';

interface RespostaEntrarSetor {
  ok: boolean;
  setorId?: string;
  lista?: EstadoAtivoListagemModel[];
  resumo?: ResumoSetor;
}

const RESUMO_VAZIO: ResumoSetor = {
  total: 0,
  produzindo: 0,
  parado: 0,
  falha: 0,
};

@Injectable({ providedIn: 'root' })
export class AtivosSetorService implements OnDestroy {
  private readonly ngZone = inject(NgZone);
  private readonly auth = inject(AuthService);

  private socket: Socket | null = null;
  private relogio: ReturnType<typeof setInterval> | null = null;
  private sincronizacaoTimer: ReturnType<typeof setTimeout> | null = null;
  private avisoTimer: ReturnType<typeof setTimeout> | null = null;
  private setorIdAtual: string | null = null;

  private readonly conectadoSignal = signal(false);
  private readonly carregandoSignal = signal(false);
  private readonly ativosSignal = signal<EstadoAtivoListagemModel[]>([]);
  private readonly resumoSignal = signal<ResumoSetor>(RESUMO_VAZIO);
  private readonly temposSignal = signal<Record<string, number>>({});
  private readonly avisoSignal = signal<string | null>(null);

  /** Relógio local: fallback enquanto nenhum tick do servidor chegou */
  readonly agora = signal(Date.now());

  readonly setorAtual = signal<string | null>(null);
  readonly isConectado = this.conectadoSignal.asReadonly();
  readonly carregando = this.carregandoSignal.asReadonly();
  readonly resumo = this.resumoSignal.asReadonly();
  readonly ativos = this.ativosSignal.asReadonly();
  readonly totalAtivos = computed(() => this.ativosSignal().length);
  readonly vazio = computed(() => !this.carregandoSignal() && this.ativosSignal().length === 0);

  /** Último aviso de conexão/erro. null = nada a exibir. */
  readonly aviso = this.avisoSignal.asReadonly();

  /** Lista ordenada por gravidade e tempo de abertura */
  readonly ativosOrdenados = computed(() =>
    [...this.ativosSignal()].sort((a, b) => {
      const peso = pesoEstado(a.tipoEstado) - pesoEstado(b.tipoEstado);
      if (peso !== 0) return peso;
      return new Date(a.dataInicial).getTime() - new Date(b.dataInicial).getTime();
    }),
  );

  constructor() {
    this.iniciarRelogio();
  }

  entrarNoSetor(setorId: string): void {
    if (!setorId) return;

    // Mesmo setor já aberto: apenas ressincroniza
    if (this.setorIdAtual === setorId && this.socket?.connected) {
      this.entrarNaSala();
      return;
    }

    this.setorIdAtual = setorId;
    this.setorAtual.set(setorId);
    this.ativosSignal.set([]);
    this.resumoSignal.set(RESUMO_VAZIO);
    this.temposSignal.set({});

    const token = this.auth.getToken();
    if (!token) {
      this.emitirAviso('Sessão expirada. Faça login novamente.');
      return;
    }

    if (this.socket) {
      const authAntigo = (this.socket.auth as { token?: string } | undefined)?.token;
      if (authAntigo !== token) {
        this.socket.disconnect();
        this.socket = null;
      }
    }

    if (!this.socket) {
      this.socket = io(`${environment.apiUrl}/estado-ativo`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        timeout: 20000,
      });

      this.registrarEventos();
    }

    if (this.socket.connected) this.entrarNaSala();
    else {
      this.carregandoSignal.set(true);
      this.socket.connect();
    }
  }

  sairDoSetor(): void {
    if (this.socket?.connected && this.setorIdAtual) {
      this.socket.emit('sairSetor', { setorId: this.setorIdAtual });
    }

    this.limparSincronizacao();
    this.limparAviso();
    this.setorIdAtual = null;
    this.setorAtual.set(null);
    this.ativosSignal.set([]);
    this.resumoSignal.set(RESUMO_VAZIO);
    this.temposSignal.set({});
    this.carregandoSignal.set(false);
  }

  recarregar(): void {
    this.entrarNaSala();
  }

  tempoDecorrido(estado: EstadoAtivoListagemModel | null | undefined): number {
    if (!estado) return 0;
    if (!estado.status) return estado.duracao ?? 0;

    const doServidor = this.temposSignal()[estado.tagAtivoId];
    if (doServidor !== undefined) return doServidor;

    const inicio = new Date(estado.dataInicial).getTime();
    if (isNaN(inicio)) return 0;
    return Math.max(0, Math.floor((this.agora() - inicio) / 1000));
  }

  /** Fecha o aviso manualmente (chamado pelo botão da tela) */
  fecharAviso(): void {
    this.limparAviso();
  }

  // --------------------------------------------------------------- privados

  private emitirAviso(mensagem: string): void {
    // Rajada de reconexão não deve trocar a mensagem a cada tentativa
    if (this.avisoSignal() === mensagem) return;

    this.limparAviso();
    this.avisoSignal.set(mensagem);

    this.avisoTimer = setTimeout(() => {
      this.avisoTimer = null;
      this.avisoSignal.set(null);
    }, 5000);
  }

  private limparAviso(): void {
    if (this.avisoTimer) {
      clearTimeout(this.avisoTimer);
      this.avisoTimer = null;
    }
    this.avisoSignal.set(null);
  }

  private registrarEventos(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.ngZone.run(() => {
        this.conectadoSignal.set(true);
        this.limparAviso();
        this.entrarNaSala();
      });
    });

    this.socket.on('connect_error', (err: Error) => {
      this.ngZone.run(() => {
        this.conectadoSignal.set(false);
        this.carregandoSignal.set(false);
        this.emitirAviso('Falha na conexão: ' + err.message);
      });
    });

    this.socket.on('disconnect', () => {
      this.ngZone.run(() => {
        this.conectadoSignal.set(false);
        this.emitirAviso('Conexão perdida. Tentando reconectar…');
      });
    });

    /* Gestor pertence também à sala 'supervisao': filtra pelo setor aberto */
    this.socket.on('estadoAtivoTrocado', (troca: EstadoTrocado) => {
      this.ngZone.run(() => this.aplicarTroca(troca));
    });

    this.socket.on('cronometroTick', (tick: CronometroTick) => {
      this.ngZone.run(() => {
        if (tick.setorId && tick.setorId !== this.setorIdAtual) return;
        this.temposSignal.update((m) => ({ ...m, [tick.ativo]: tick.tempo }));
      });
    });

    this.socket.on('setorResumo', (resumo: ResumoSetor & { setorId: string }) => {
      this.ngZone.run(() => {
        if (resumo.setorId !== this.setorIdAtual) return;
        this.resumoSignal.set({
          total: resumo.total,
          produzindo: resumo.produzindo,
          parado: resumo.parado,
          falha: resumo.falha,
        });
      });
    });

    this.socket.on('error_response', (data: { errorCode?: string; message?: string }) => {
      this.ngZone.run(() => {
        this.carregandoSignal.set(false);
        this.emitirAviso(data?.message || 'Erro ao sincronizar o painel.');
      });
    });
  }

  private entrarNaSala(): void {
    if (!this.socket?.connected || !this.setorIdAtual) return;

    this.carregandoSignal.set(true);

    this.socket.emit(
      'entrarSetor',
      { setorId: this.setorIdAtual },
      (resposta: RespostaEntrarSetor) => {
        this.ngZone.run(() => {
          this.carregandoSignal.set(false);
          if (!resposta?.ok) return;

          this.ativosSignal.set(resposta.lista ?? []);
          this.resumoSignal.set(resposta.resumo ?? RESUMO_VAZIO);
        });
      },
    );
  }

  /** Sincroniza a lista do setor (usado quando chega troca de ativo desconhecido) */
  private sincronizarLista(): void {
    if (!this.socket?.connected || !this.setorIdAtual) return;

    this.socket.emit(
      'listarEstadoAtivosSetor',
      { setorId: this.setorIdAtual },
      (lista: EstadoAtivoListagemModel[] | null) => {
        this.ngZone.run(() => {
          this.ativosSignal.set(lista ?? []);
          this.carregandoSignal.set(false);
        });
      },
    );
  }

  private agendarSincronizacao(): void {
    if (this.sincronizacaoTimer) return;

    this.sincronizacaoTimer = setTimeout(() => {
      this.sincronizacaoTimer = null;
      this.sincronizarLista();
    }, 500);
  }

  private limparSincronizacao(): void {
    if (this.sincronizacaoTimer) {
      clearTimeout(this.sincronizacaoTimer);
      this.sincronizacaoTimer = null;
    }
  }

  private aplicarTroca({ ativo, atual, setorId }: EstadoTrocado): void {
    // Zera o tempo antigo do ativo para o novo estado não mostrar o anterior
    const tempos = { ...this.temposSignal() };
    delete tempos[ativo];
    this.temposSignal.set(tempos);

    // Evento de outro setor (o gestor também recebe a sala 'supervisao')
    const setorDoEvento = setorId ?? atual?.tagAtivo?.ativo?.setorId ?? null;
    if (setorDoEvento && setorDoEvento !== this.setorIdAtual) return;

    const naLista = this.ativosSignal().find((e) => e.tagAtivoId === ativo);
    const semOutro = this.ativosSignal().filter((e) => e.tagAtivoId !== ativo);

    // Estado fechado → sai da lista
    if (!atual?.status) {
      this.ativosSignal.set(semOutro);
      return;
    }

    // Preserva a tag que já estava na lista (o payload da troca não traz relação)
    const novo: EstadoAtivoListagemModel = {
      ...atual,
      tagAtivo: atual.tagAtivo ?? naLista?.tagAtivo ?? null,
      alocacaoOperacional: atual.alocacaoOperacional ?? naLista?.alocacaoOperacional ?? null,
    };

    this.ativosSignal.set([...semOutro, novo]);

    // Ativo novo no setor, sem tag conhecida → busca a lista enriquecida
    if (!novo.tagAtivo) this.agendarSincronizacao();
  }

  private iniciarRelogio(): void {
    this.ngZone.runOutsideAngular(() => {
      this.relogio = setInterval(() => {
        this.ngZone.run(() => this.agora.set(Date.now()));
      }, 1000);
    });
  }

  ngOnDestroy(): void {
    this.limparSincronizacao();
    this.limparAviso();
    if (this.relogio) clearInterval(this.relogio);
    this.socket?.disconnect();
    this.socket = null;
  }
}
