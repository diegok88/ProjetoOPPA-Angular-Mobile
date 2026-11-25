import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { UpperCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { DialogFinalizarService } from '../../services/dialog-finalizar.service';
import { DialogoConfirmarData } from '../../entities/dialogo-confirmar.model';

@Component({
  selector: 'app-dialogo-confirmar',
  imports: [UpperCasePipe],
  templateUrl: './dialogo-confirmar.html',
  styleUrl: './dialogo-confirmar.scss',
})
export class DialogoConfirmar {
  public data = inject<DialogoConfirmarData>(DIALOG_DATA);
  private dialogRef = inject<DialogRef<string>>(DialogRef);
  private finalizarService = inject(DialogFinalizarService);

  public carregando = signal<boolean>(false);

  constructor() {
    // Clique no backdrop equivale a cancelar
    this.dialogRef.backdropClick
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.fecharModal('cancelado'));
  }

  async onConfirmar(): Promise<void> {
    if (this.carregando()) return;

    this.carregando.set(true);
    this.finalizarService.limparErros();

    try {
      const acao = this.data.acao();
      if (acao instanceof Promise) {
        await acao;
      } else {
        await firstValueFrom(acao);
      }
      this.dialogRef.close('finalizado');
    } catch (error: unknown) {
      this.finalizarService.definirErros(this.normalizarErros(error));
      this.dialogRef.close('erro');
    } finally {
      this.carregando.set(false);
    }
  }

  public fecharModal(resultado: string): void {
    if (this.carregando()) return;
    this.dialogRef.close(resultado);
  }

  private normalizarErros(error: unknown): string[] {
    if (Array.isArray(error)) return error.map(String);
    if (typeof error === 'string') return [error];
    return ['Erro inesperado.'];
  }
}
