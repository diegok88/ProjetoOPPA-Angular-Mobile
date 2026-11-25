import { computed, inject, Injectable } from '@angular/core';
import { MenuItem } from '../interfaces/menu-item.interface';
import { AuthService } from './auth.service';
import { ROLES_MAP } from '../constants/role-map.const';

const TODOS = [ROLES_MAP.ASN1, ROLES_MAP.ADN1, ROLES_MAP.GER1, ROLES_MAP.SUP1];
const ASN_ADN = [ROLES_MAP.ASN1, ROLES_MAP.ADN1];

@Injectable({
  providedIn: 'root',
})
export class MenuItemService {
  private auth = inject(AuthService);

  // Fonte única do menu. Cada item e subitem define quem o enxerga.
  private readonly listaMenu: MenuItem[] = [
    {
      rotulo: 'Principal',
      icone: 'home',
      caminho: 'principal',
      papeis: TODOS,
    },

    {
      rotulo: 'Gestão',
      icone: 'group',
      chave: 'gestao',
      papeis: TODOS,
      children: [
        { rotulo: 'Colaboradores', icone: 'badge', caminho: 'usuario', papeis: TODOS },
        {
          rotulo: 'Alocação Operacional',
          icone: 'swap_horiz',
          caminho: 'alocacao-operacional',
          papeis: [ROLES_MAP.ASN1, ROLES_MAP.SUP1],
        },
        {
          rotulo: 'Competência Setorial',
          icone: 'corporate_fare',
          caminho: 'competencia-setorial',
          papeis: [ROLES_MAP.ASN1, ROLES_MAP.GER1],
        },
        {
          rotulo: 'Competência Operacional',
          icone: 'engineering',
          caminho: 'competencia-operacional',
          papeis: [ROLES_MAP.ASN1, ROLES_MAP.SUP1],
        },
        { rotulo: 'Dispensas', icone: 'event_busy', caminho: 'dispensas', papeis: TODOS },
        { rotulo: 'Penalidades', icone: 'gavel', caminho: 'penalidades', papeis: TODOS },
      ],
    },

    {
      rotulo: 'Assistência',
      icone: 'support_agent',
      chave: 'assistencia',
      papeis: [ROLES_MAP.ASN1],
      children: [
        { rotulo: 'Perfil', icone: 'assignment_ind', caminho: 'perfil', papeis: [ROLES_MAP.ASN1] },
        { rotulo: 'Registros', icone: 'dvr', caminho: 'registros', papeis: [ROLES_MAP.ASN1] },
      ],
    },

    {
      rotulo: 'Administrador',
      icone: 'admin_panel_settings',
      chave: 'administrador',
      papeis: [ROLES_MAP.ADN1],
      children: [
        { rotulo: 'Registros', icone: 'dvr', caminho: 'registros', papeis: [ROLES_MAP.ADN1] },
      ],
    },

    {
      rotulo: 'Solicitações',
      icone: 'list_alt',
      chave: 'solicitacoes',
      papeis: TODOS,
      children: [
        {
          rotulo: 'Escrever',
          icone: 'edit_square',
          caminho: 'solicitacoes-escrever',
          papeis: TODOS,
        },
        { rotulo: 'Enviadas', icone: 'outbox', caminho: 'solicitacoes-enviadas', papeis: TODOS },
        {
          rotulo: 'Recebidas',
          icone: 'move_to_inbox',
          caminho: 'solicitacoes-recebidas',
          papeis: TODOS,
        },
      ],
    },

    {
      rotulo: 'Eficiência',
      icone: 'insert_chart',
      chave: 'eficiencia',
      papeis: ASN_ADN,
      children: [
        {
          rotulo: 'Monitoração',
          icone: 'monitoring',
          caminho: 'eficiencia/monitoracao',
          papeis: ASN_ADN,
        },
        {
          rotulo: 'Ativos',
          icone: 'precision_manufacturing',
          caminho: 'eficiencia/ativos',
          papeis: ASN_ADN,
        },
        {
          rotulo: 'Operacional',
          icone: 'speed',
          caminho: 'eficiencia/operacional',
          papeis: ASN_ADN,
        },
      ],
    },

    {
      rotulo: 'Empresa',
      icone: 'factory',
      chave: 'empresa',
      papeis: ASN_ADN,
      children: [
        { rotulo: 'Empresa', icone: 'add_business', caminho: 'empresa', papeis: ASN_ADN },
        { rotulo: 'Setores', icone: 'account_tree', caminho: 'setores', papeis: ASN_ADN },
      ],
    },

    {
      rotulo: 'Ativos',
      icone: 'settings_applications',
      chave: 'ativos',
      papeis: TODOS,
      children: [
        { rotulo: 'Ativos', icone: 'precision_manufacturing', caminho: 'ativos', papeis: ASN_ADN },
        { rotulo: 'Tags Ativos', icone: 'sell', caminho: 'tag-ativo', papeis: ASN_ADN },
        {
          rotulo: 'Estados do Ativos',
          icone: 'manage_history',
          caminho: 'estados-ativos',
          papeis: TODOS,
        },
        {
          rotulo: 'Ocorrências',
          icone: 'report_problem',
          caminho: 'ativos/ocorrencias',
          papeis: TODOS,
        },
        { rotulo: 'Falhas', icone: 'warning', caminho: 'falhas', papeis: ASN_ADN },
        { rotulo: 'Soluções', icone: 'lightbulb', caminho: 'solucoes', papeis: ASN_ADN },
      ],
    },

    {
      rotulo: 'Usuário',
      icone: 'account_box',
      chave: 'usuario',
      papeis: TODOS,
      children: [
        { rotulo: 'Informações', icone: 'id_card', caminho: 'informacoes', papeis: TODOS },
        { rotulo: 'Trocar senha', icone: 'lock_reset', caminho: 'trocar-senha', papeis: TODOS },
        { rotulo: 'Trocar PIN', icone: 'keyboard_lock', caminho: 'trocar-pin', papeis: TODOS },
      ],
    },
  ];

  // Remove itens/subitens que o perfil não pode ver.
  // Um grupo só aparece se sobrar pelo menos um filho visível.
  private filtrarPorPerfil(itens: MenuItem[], perfil: string): MenuItem[] {
    return itens
      .filter((item) => !item.papeis?.length || item.papeis.includes(perfil))
      .map((item) =>
        item.children ? { ...item, children: this.filtrarPorPerfil(item.children, perfil) } : item,
      )
      .filter((item) => !item.children || item.children.length > 0);
  }

  public menuItens = computed<MenuItem[]>(() => {
    const perfil = this.auth.role();
    if (!perfil) return [];
    return this.filtrarPorPerfil(this.listaMenu, perfil);
  });
}
