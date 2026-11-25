import { computed, inject, Injectable } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Injectable({ providedIn: 'root' })
export class EscopoSolicitacoesService {
  private readonly auth = inject(AuthService);

  /** Quem envia e quem cancela. */
  readonly solicitanteId = computed(
    () => this.ler(['solicitanteId', 'operadorId', 'colaboradorId']) ?? this.idSessao(),
  );

  /** Quem aceita e recusa. */
  readonly solicitadoId = computed(
    () =>
      this.ler(['solicitadoId', 'gestorId', 'supervisorId', 'responsavelId']) ?? this.idSessao(),
  );

  readonly tagAtivoId = computed(() => this.ler(['tagAtivoId', 'ativoId', 'tagId']));

  readonly podeCancelar = computed(() => !!this.solicitanteId());

  readonly podeResponder = computed(() => !!this.solicitadoId());

  private idSessao(): string | null {
    const perfil = this.auth.usuario() as unknown as Record<string, unknown> | null | undefined;

    const id = perfil?.['id'];
    return typeof id === 'string' && id.trim() ? id.trim() : null;
  }

  private ler(chaves: string[]): string | null {
    const perfil = this.auth.usuario() as unknown as Record<string, unknown> | null | undefined;

    if (!perfil) return null;

    for (const chave of chaves) {
      const valor = perfil[chave];
      if (typeof valor === 'string' && valor.trim()) return valor.trim();
    }

    return null;
  }
}
