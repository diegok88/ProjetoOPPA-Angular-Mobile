import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { DialogoFinalizar } from '../components/dialogo-finalizar/dialogo-finalizar';
import { DialogoFinalizarData } from '../entities/dialogo-finalizar.modal';

@Injectable({ providedIn: 'root' })
export class DialogFinalizarService {
  private dialog = inject(Dialog);

  private errosSignal = signal<string[]>([]);
  public ultimosErros = this.errosSignal.asReadonly();

  public definirErros(erros: string[]): void {
    this.errosSignal.set(erros);
  }

  public limparErros(): void {
    this.errosSignal.set([]);
  }

  finalizar(config: DialogoFinalizarData): Observable<void> {
    const dialogRef = this.dialog.open<void>(DialogoFinalizar, {
      data: {
        ...config,
        erros: config.erros ?? this.ultimosErros(),
      },
      disableClose: true,
      backdropClass: 'app-modal-backdrop',
    });

    return dialogRef.closed as Observable<void>;
  }
}
