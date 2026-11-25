import { Routes } from '@angular/router';
import { LoginUser } from './modules/login-user/login-user';
import { DashboardUser } from './modules/dashboard-user/dashboard-user';
import { roleGuard } from './constants/role.guard';
import { ROLES_MAP } from './constants/role-map.const';
import { AccessDenied } from './modules/access-denied/access-denied';

export const routes: Routes = [
  { path: '', redirectTo: 'login-user', pathMatch: 'full' },
  { path: 'login-user', component: LoginUser },
  {
    path: 'dashboard-user',
    component: DashboardUser, 
    canActivate: [roleGuard],
    data: { roles: [ROLES_MAP.ASN1, ROLES_MAP.ADN1, ROLES_MAP.GER1, ROLES_MAP.SUP1] },
    children: [
      {
        path: 'principal',
        loadComponent: () => import('./components/principal/principal').then((p) => p.Principal),
        canActivate: [roleGuard],
        data: { roles: [ROLES_MAP.ASN1, ROLES_MAP.ADN1, ROLES_MAP.GER1, ROLES_MAP.SUP1] },
      },
      // GESTÂO
      {
        path: 'alocacao-operacional',
        loadComponent: () =>
          import('./components/alocacao-operacional/alocacao-operacional').then(
            (a) => a.AlocacaoOperacional,
          ),
        canActivate: [roleGuard],
        data: { roles: [ROLES_MAP.ASN1, ROLES_MAP.SUP1] },
      },
      {
        path: 'competencia-operacional',
        loadComponent: () =>
          import('./components/competencia-operacional/competencia-operacional').then(
            (c) => c.CompetenciaOperacional,
          ),
        canActivate: [roleGuard],
        data: { roles: [ROLES_MAP.ASN1, ROLES_MAP.SUP1] },
      },

      {
        path: 'estados-ativos',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./components/estado-ativo/estado-ativo-setores/estado-ativo-setores').then(
                (m) => m.EstadoAtivoSetores,
              ),
            canActivate: [roleGuard],
            data: { roles: [ROLES_MAP.ASN1, ROLES_MAP.ADN1, ROLES_MAP.GER1, ROLES_MAP.SUP1] },
          },
          {
            path: 'ativos/:setorId',
            loadComponent: () =>
              import('./components/estado-ativo/estado-ativo-ativos/estado-ativo-ativos').then(
                (m) => m.EstadoAtivoAtivos,
              ),
            canActivate: [roleGuard],
            data: { roles: [ROLES_MAP.ASN1, ROLES_MAP.ADN1, ROLES_MAP.GER1, ROLES_MAP.SUP1] },
          },
        ],
      },

      // SOLICITAÇÕES
      {
        path: 'solicitacoes-escrever',
        loadComponent: () =>
          import('./components/solicitacoes/solicitacoes-escrever/solicitacoes-escrever').then(
            (m) => m.SolicitacoesEscrever,
          ),
      },
      {
        path: 'solicitacoes-enviadas',
        loadComponent: () =>
          import('./components/solicitacoes/solicitacoes-enviadas/solicitacoes-enviadas').then(
            (m) => m.SolicitacoesEnviadas,
          ),
      },
      {
        path: 'solicitacoes-recebidas',
        loadComponent: () =>
          import('./components/solicitacoes/solicitacoes-recebidas/solicitacoes-recebidas').then(
            (m) => m.SolicitacoesRecebidas,
          ),
      },
      //  USUÁRIOS
      {
        path: 'informacoes',
        loadComponent: () =>
          import('./components/informacoes/informacoes').then((i) => i.Informacoes),
        canActivate: [roleGuard],
        data: { roles: [ROLES_MAP.ASN1, ROLES_MAP.ADN1, ROLES_MAP.GER1, ROLES_MAP.SUP1] },
      },
      {
        path: 'trocar-senha',
        loadComponent: () =>
          import('./components/trocar-senha/trocar-senha').then((t) => t.TrocarSenha),
        canActivate: [roleGuard],
        data: { roles: [ROLES_MAP.ASN1, ROLES_MAP.ADN1, ROLES_MAP.GER1, ROLES_MAP.SUP1] },
      },
      {
        path: 'trocar-pin',
        loadComponent: () => import('./components/trocar-pin/trocar-pin').then((t) => t.TrocarPin),
        canActivate: [roleGuard],
        data: { roles: [ROLES_MAP.ASN1, ROLES_MAP.ADN1, ROLES_MAP.GER1, ROLES_MAP.SUP1] },
      },
      //  DIRECIONA AO INICIALIZAR O DASHBOARD
      {
        path: '',
        redirectTo: 'principal',
        pathMatch: 'full',
      },
    ],
  },
  { path: 'access-denied', component: AccessDenied },
  { path: '**', redirectTo: 'login-user' },
];
