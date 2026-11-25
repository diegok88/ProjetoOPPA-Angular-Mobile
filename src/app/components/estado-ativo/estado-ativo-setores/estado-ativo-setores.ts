import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CompetenciaSetorialGestorService } from '../anexos/competencia-setorial-gestor.service';
import { SetorCompetenciaModel } from '../anexos/estado-ativo.model';
import { rotaAtivosDoSetor } from '../anexos/estado-ativo.routes';

@Component({
  selector: 'app-estado-ativo-setores',
  standalone: true,
  templateUrl: './estado-ativo-setores.html',
  styleUrl: './estado-ativo-setores.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadoAtivoSetores implements OnInit {
  private readonly service = inject(CompetenciaSetorialGestorService);
  private readonly router = inject(Router);

  readonly setores = this.service.setores;
  readonly carregando = this.service.carregando;
  readonly erro = this.service.erro;
  readonly vazio = this.service.vazio;
  readonly total = this.service.totalSetores;

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.service.listarDoGestor().subscribe();
  }

  abrirSetor(setor: SetorCompetenciaModel): void {
    this.router.navigate(rotaAtivosDoSetor(setor.setorId), {
      queryParams: { nome: setor.descricao },
    });
  }

  voltar(): void {
    this.router.navigate(['/dashboard-user', 'principal']);
  }
}
