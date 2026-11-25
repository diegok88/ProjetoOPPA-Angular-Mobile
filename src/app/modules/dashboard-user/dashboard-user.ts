import {
  Component,
  DestroyRef,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { MenuItemService } from '../../services/menu-item.service';
import { IconesSvg } from '../../components/icones/icones-svg';
import { NotificacaoSolicitacaoService } from '../../components/solicitacoes/anexos/solicitacoes-notificacoes.service';

@Component({
  selector: 'app-dashboard-user',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, IconesSvg],
  templateUrl: './dashboard-user.html',
  styleUrl: './dashboard-user.scss',
})
export class DashboardUser implements OnInit, OnDestroy {
  protected authService = inject(AuthService);
  protected menuService = inject(MenuItemService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private notificacoes = inject(NotificacaoSolicitacaoService);

  protected menuItens = this.menuService.menuItens;
  protected readonly usuario = this.authService.usuario;

  // Chave do grupo aberto (apenas um por vez)
  protected activeSubmenu = signal<string | null>(null);

  // Menu sobreposto: começa fechado
  protected menuAberto = signal<boolean>(false);

  ngOnInit(): void {
    this.carregarPerfil();

    // Liga o socket de solicitações, o contador e a notificação local.
    void this.notificacoes.iniciar();

    // Fecha o menu sempre que uma rota for carregada
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.fecharMenu());
  }

  ngOnDestroy(): void {
    // Para o monitoramento e encerra o socket ao sair do dashboard.
    this.notificacoes.encerrar();
  }

  // Busca os dados do usuário logado (empresa, crachá, perfil).
  private carregarPerfil(): void {
    this.authService
      .obterPerfil()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => this.router.navigate(['/login-user']),
      });
  }

  // Abre/fecha o submenu (sem alterar o estado do menu)
  protected onGrupoClick(chave: string | undefined, event: Event): void {
    event.preventDefault();
    if (!chave) return;
    this.activeSubmenu.update((atual) => (atual === chave ? null : chave));
  }

  protected toggleMenu(): void {
    this.menuAberto.update((atual) => !atual);
  }

  protected fecharMenu(): void {
    this.menuAberto.set(false);
    this.activeSubmenu.set(null);
  }

  // Fecha o menu pela tecla ESC
  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.menuAberto()) this.fecharMenu();
  }

  protected logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login-user']),
      error: () => this.router.navigate(['/login-user']),
    });
  }
}
