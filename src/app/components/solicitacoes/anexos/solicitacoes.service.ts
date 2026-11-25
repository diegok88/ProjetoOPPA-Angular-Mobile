import { computed, inject, Injectable, signal } from '@angular/core';
import { from, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../constants/environment.const';
import {
  StatusSolicitacao,
  ContadorSolicitacoes,
  SolicitacaoForm,
  TipoSolicitacaoModel,
  FiltroHistorico,
  PaginaHistorico,
} from './solicitacao.model';
import { buildSolicitacoesPayload } from './solicitacoes-params';

const NAMESPACE = 'solicitacoes';
const TIMEOUT_MS = 12000;

/** Escopo de dados do terminal (operador e gestor alocados). */
export interface EscopoSolicitacoes {
  solicitanteId?: string;
  solicitadoId?: string;
  tagAtivoId?: string;
}

export interface ResponderSolicitacaoPayload {
  id: string;
  acao: Extract<StatusSolicitacao, 'ACEITA' | 'RECUSADA'> | 'ACEITAR' | 'RECUSAR';
  solicitadoId?: string;
  observacao?: string;
}

@Injectable({ providedIn: 'root' })
export class SolicitacaoService {
  private readonly auth = inject(AuthService);
  private socket: Socket | null = null;

  readonly conectado = signal(false);
  readonly contador = signal<ContadorSolicitacoes | null>(null);

  /**
   * O evento 'exception' do socket não carrega correlação. Com duas chamadas
   * em voo, a exceção de uma chega ao listener da outra. Serializar por evento
   * elimina o problema na raiz.
   */
  private readonly filas = new Map<string, Promise<unknown>>();

  /* ==================== CONEXÃO ==================== */
  conectar(): void {
    if (this.socket) return;

    const token = this.obterToken();
    if (!token) return;

    this.socket = io(`${environment.apiUrl}/${NAMESPACE}`, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => this.conectado.set(true));
    this.socket.on('disconnect', () => this.conectado.set(false));
    this.socket.on('solicitacaoContador', (c: ContadorSolicitacoes) => this.contador.set(c));
  }

  desconectar(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.filas.clear();
    this.conectado.set(false);
  }

  /* ==================== AÇÕES ==================== */
  criar(dto: SolicitacaoForm): Observable<unknown> {
    return this.emitir('createSolicitacao', dto);
  }

  listarTipos(): Observable<TipoSolicitacaoModel[]> {
    return this.emitir<TipoSolicitacaoModel[]>('listarTiposSolicitacao');
  }

  contar(escopo?: EscopoSolicitacoes): Observable<ContadorSolicitacoes> {
    return this.emitir<ContadorSolicitacoes>('contarSolicitacoes', escopo);
  }

  responder(dto: ResponderSolicitacaoPayload): Observable<unknown> {
    return this.emitir('responderSolicitacao', dto);
  }

  cancelar(id: string, solicitanteId?: string): Observable<unknown> {
    return this.emitir('cancelarSolicitacao', { id, solicitanteId });
  }

  marcarVisualizada(ids: string[], solicitadoId?: string): Observable<{ marcadas: number }> {
    return this.emitir<{ marcadas: number }>('marcarSolicitacaoVisualizada', {
      ids,
      solicitadoId,
    });
  }

  /* ==================== HISTÓRICO ==================== */
  historico(filtro: FiltroHistorico): Observable<PaginaHistorico> {
    return this.emitir<PaginaHistorico>('findAllSolicitacoes', buildSolicitacoesPayload(filtro));
  }

  /* ==================== TRANSPORTE ==================== */
  emitirEvento<T>(evento: string, payload?: unknown): Observable<T> {
    return this.emitir<T>(evento, payload);
  }

  private emitir<T>(evento: string, payload?: unknown): Observable<T> {
    return from(this.enfileirar(evento, () => this.despachar<T>(evento, payload)));
  }

  private enfileirar<T>(evento: string, tarefa: () => Promise<T>): Promise<T> {
    const anterior = this.filas.get(evento) ?? Promise.resolve();
    const atual = anterior.catch(() => undefined).then(tarefa);

    this.filas.set(
      evento,
      atual.catch(() => undefined),
    );

    return atual;
  }

  private async despachar<T>(evento: string, payload?: unknown): Promise<T> {
    const socket = await this.socketPronto();

    return new Promise<T>((resolve, reject) => {
      let erroServidor: unknown = null;

      const aoErro = (pacote: unknown) => {
        erroServidor = pacote;
      };

      socket.on('exception', aoErro);

      const temporizador = setTimeout(() => {
        socket.off('exception', aoErro);
        reject(erroServidor ?? { message: 'Tempo esgotado ao falar com o servidor.' });
      }, TIMEOUT_MS);

      const encerrar = () => {
        clearTimeout(temporizador);
        socket.off('exception', aoErro);
      };

      socket.emit(evento, payload, (resposta: unknown) => {
        encerrar();

        if (erroServidor) {
          reject(erroServidor);
          return;
        }

        if (
          resposta &&
          typeof resposta === 'object' &&
          (resposta as { status?: string }).status === 'error'
        ) {
          reject(resposta);
          return;
        }

        resolve(resposta as T);
      });
    });
  }

  private async socketPronto(): Promise<Socket> {
    if (!this.socket) this.conectar();

    const socket = this.socket;

    if (!socket) {
      throw { message: 'Sem conexão com o servidor de solicitações.' };
    }

    if (socket.connected) return socket;

    await new Promise<void>((resolve, reject) => {
      const aoConectar = () => {
        clearTimeout(temporizador);
        resolve();
      };

      const temporizador = setTimeout(() => {
        socket.off('connect', aoConectar);
        reject({
          message: 'Não foi possível conectar ao servidor de solicitações.',
        });
      }, TIMEOUT_MS);

      socket.once('connect', aoConectar);
      socket.connect();
    });

    return socket;
  }

  private obterToken(): string | null {
    const servico = this.auth as unknown as Record<string, unknown>;

    for (const nome of ['token', 'accessToken', 'obterToken', 'getToken']) {
      const valor = servico[nome];
      const bruto = typeof valor === 'function' ? (valor as () => unknown).call(this.auth) : valor;

      if (typeof bruto === 'string' && bruto) return bruto;
    }

    return null;
  }
}
