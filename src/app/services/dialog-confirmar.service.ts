import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DialogoConfirmarData } from '../entities/dialogo-confirmar.model';
import { DialogoConfirmar } from '../components/dialogo-confirmar/dialogo-confirmar';

@Injectable({ providedIn: 'root' })
export class DialogConfirmarService {
  private dialog = inject(Dialog);

  confirmar<T>(config: {
    icone: string;
    titulo: string;
    entidade?: string;
    mensagem: string;
    dados?: string;
    acao: () => Observable<T> | Promise<T>;
  }): Observable<string> {
    const data: DialogoConfirmarData = {
      icone: config.icone,
      titulo: config.titulo,
      entidade: config.entidade,
      mensagem: config.mensagem,
      dados: config.dados,
      acao: config.acao,
    };

    const dialogRef = this.dialog.open<string>(DialogoConfirmar, {
      data,
      disableClose: true,
      backdropClass: 'app-modal-backdrop',
    });

    return dialogRef.closed as Observable<string>;
  }
}
