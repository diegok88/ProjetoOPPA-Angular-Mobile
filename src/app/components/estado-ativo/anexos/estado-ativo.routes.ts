export const ROTAS_ESTADO_ATIVO = {
  dashboard: 'dashboard-user',
  raiz: 'estados-ativos',
  ativos: 'ativos',
} as const;

export const rotaSetores = (): string[] => [
  `/${ROTAS_ESTADO_ATIVO.dashboard}`,
  ROTAS_ESTADO_ATIVO.raiz,
];

export const rotaAtivosDoSetor = (setorId: string): string[] => [
  `/${ROTAS_ESTADO_ATIVO.dashboard}`,
  ROTAS_ESTADO_ATIVO.raiz,
  ROTAS_ESTADO_ATIVO.ativos,
  setorId,
];
