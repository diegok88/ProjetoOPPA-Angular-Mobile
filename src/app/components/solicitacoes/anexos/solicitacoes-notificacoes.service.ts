import { Injectable, effect, inject, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

import { SolicitacaoService } from './solicitacoes.service';
import { ContadorSolicitacoes } from './solicitacao.model';

const CANAL_ID = 'solicitacoes';

@Injectable({ providedIn: 'root' })
export class NotificacaoSolicitacaoService {
  private readonly solicitacoes = inject(SolicitacaoService);

  private readonly ativo = signal(false);
  private visto: number | null = null;
  private preparado = false;

  constructor() {
    effect(() => {
      if (!this.ativo()) return;

      const contador = this.solicitacoes.contador();
      if (!contador) return;

      this.avaliar(contador);
    });
  }

  get suportado(): boolean {
    return Capacitor.isNativePlatform();
  }

  async iniciar(): Promise<void> {
    if (this.ativo()) return;

    this.solicitacoes.conectar();
    await this.prepararDispositivo();

    this.visto = this.numero(this.solicitacoes.contador());
    this.ativo.set(true);
  }

  parar(): void {
    this.ativo.set(false);
    this.visto = null;
  }

  encerrar(): void {
    this.parar();
    this.solicitacoes.desconectar();
  }

  private avaliar(contador: ContadorSolicitacoes): void {
    const atual = this.numero(contador);

    if (this.visto === null) {
      this.visto = atual;
      return;
    }

    if (atual > this.visto) {
      const diferenca = atual - this.visto;
      void this.disparar(
        diferenca > 1 ? `${diferenca} novas solicitações` : 'Você recebeu uma nova solicitação',
      );
    }

    this.visto = atual;
  }

  /** Quantidade relevante para o badge: pendentes ainda não visualizadas. */
  private numero(contador: ContadorSolicitacoes | null): number {
    if (!contador) return 0;

    if (typeof contador.naoVisualizadas === 'number') {
      return contador.naoVisualizadas;
    }

    return contador.recebidas.pendentes;
  }

  private async prepararDispositivo(): Promise<void> {
    if (!this.suportado || this.preparado) return;
    this.preparado = true;

    try {
      const permissoes = await LocalNotifications.checkPermissions();
      if (permissoes.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }

      if (Capacitor.getPlatform() === 'android') {
        await LocalNotifications.createChannel({
          id: CANAL_ID,
          name: 'Solicitações',
          description: 'Novas solicitações recebidas',
          importance: 5,
          visibility: 1,
          vibration: true,
        });
      }
    } catch {}
  }

  private async disparar(corpo: string): Promise<void> {
    if (!this.suportado) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 2_000_000_000),
            title: 'Nova solicitação',
            body: corpo,
            channelId: CANAL_ID,
            schedule: { at: new Date(Date.now() + 500) },
          },
        ],
      });
    } catch {}
  }
}
