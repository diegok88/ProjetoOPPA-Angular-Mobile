import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

import { DialogFinalizarService } from '../../services/dialog-finalizar.service';
import { DialogoFinalizarData } from '../../entities/dialogo-finalizar.modal';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialogo-finalizar',
  imports: [MatButtonModule],
  templateUrl: './dialogo-finalizar.html',
  styleUrl: './dialogo-finalizar.scss',
})
export class DialogoFinalizar {
  public data = inject<DialogoFinalizarData>(DIALOG_DATA);
  private finalizarService = inject(DialogFinalizarService);
  private dialogRef = inject<DialogRef<void>>(DialogRef);

  fechar(): void {
    this.finalizarService.limparErros();
    this.dialogRef.close();
  }
}
