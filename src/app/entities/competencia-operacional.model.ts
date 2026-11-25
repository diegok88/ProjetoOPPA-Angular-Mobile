export interface CompetenciaOperacionalModel {
  id?: string;
  codigo: number | undefined;
  operadorId: string;
  operador?: { id: string; nome: string; cracha: string } | null;
  gestorId: string;
  gestor?: { id: string; nome: string; cracha: string } | null;
  ativoId: string;
  ativo?: { id: string; descricao: string; modelo: string } | null;
  status?: boolean;
}

export interface CompetenciaOperacionalForm {
  ativoId: string;
}

export const FiltroCompetenciaOperacional = {
  TOTAIS: { valor: 'TOTAIS', label: 'TOTAIS' },
  ATIVOS: { valor: 'ATIVOS', label: 'ATIVOS' },
  INATIVOS: { valor: 'INATIVOS', label: 'INATIVOS' },
} as const;

export type FiltroCompetenciaOperacionalType =
  (typeof FiltroCompetenciaOperacional)[keyof typeof FiltroCompetenciaOperacional]['valor'];

export const CamposCompetenciaOperacional: (keyof CompetenciaOperacionalForm)[] = ['ativoId'];

export const CamposCompetenciaOperacionalNumeros: (keyof CompetenciaOperacionalForm)[] = [];

export const CamposCompetenciaOperacionalLetras: (keyof CompetenciaOperacionalForm)[] = [];

export const CamposCompetenciaOperacionalData: (keyof CompetenciaOperacionalForm)[] = [];

export const CamposCompetenciaOperacionalLivres: (keyof CompetenciaOperacionalForm)[] = [];

export const CompetenciaOperacionalMap = {
  ID: 'id',
  OPERADOR_ID: 'operadorId',
  OPERADOR: 'operador',
  GESTOR_ID: 'gestorId',
  GESTOR: 'gestor',
  ATIVO_ID: 'ativoId',
  ATIVO: 'ativo',
  STATUS: 'status',
} as const;

export type CompetenciaOperacionalType =
  (typeof CompetenciaOperacionalMap)[keyof typeof CompetenciaOperacionalMap];

export const INICIALIZAR_COMPETENCIA_OPERACIONAL_ENTITY = (): CompetenciaOperacionalModel => ({
  id: '',
  codigo: undefined,
  operadorId: '',
  operador: undefined,
  gestorId: '',
  gestor: undefined,
  ativoId: '',
  ativo: undefined,
  status: undefined,
});

export const INICIALIZAR_COMPETENCIA_OPERACIONAL_FORMS = (): CompetenciaOperacionalForm => ({
  ativoId: '',
});

export type ErrorCompetenciaOperacionalType =
  // Ativo
  'emptyAtivoId' | 'equalAtivoId' | null;

export function getErrorCompetenciaOperacionalMessage(
  error: ErrorCompetenciaOperacionalType,
): string {
  switch (error) {
    // ─── Ativo ───
    case 'emptyAtivoId':
      return 'O Ativo é obrigatório.';
    case 'equalAtivoId':
      return 'O Ativo informado é igual ao anterior!';
    default:
      return '';
  }
}
