export interface ContadorAlocacao {
  total: number;
  aceito: number;
  recusado: number;
  aguardando: number;
  alocado: number;
  disponivel: number;
  indisponivel: number;
  finalizado: number;
}

/* MODELO DA ENTIDADE */
export interface AlocacaoOperacionalModel {
  id?: string;
  codigo?: number;
  operadorId?: string | null;
  operador?: { nome: string; cracha: string } | null;
  gestorId?: string | null;
  gestor?: { nome: string; cracha: string } | null;
  tagAtivoId: string;
  tagAtivo?: {
    id: string;
    descricao: string;
    ativo: { id: string; descricao: string; modelo: string; setorId: string };
  } | null;
  turno: TipoTurnoType;
  alocadoEm: Date | null;
  finalizadoEm: Date | null;
  condicao?: CondicaoAlocacaoType;
  situacao?: SituacaoAlocacaoType;
  status?: boolean;
}

export interface AlocacaoOperacionalForm {
  operadorId?: string;
}

export interface AlertaAlocacaoOperacionalModel {
  alocacao: number;
}

export interface AlocacaoOperacionalUpdate {
  operadorId?: string;
  situacao: string;
  condicao?: string;
  alocadoEm?: Date;
  finalizadoEm?: Date;
}

export interface AlocacaoOperacionalSolicitacaoQuery {
  gestorId?: string;
  tagAtivoId?: string;
  situacao?: SituacaoAlocacaoType;
}

/* TIPOS DE TURNO */
export const TipoTurno = {
  MANHA: { valor: 'MANHA', label: 'MANHÃ' },
  TARDE: { valor: 'TARDE', label: 'TARDE' },
  NOITE: { valor: 'NOITE', label: 'NOITE' },
} as const;

export type TipoTurnoType = (typeof TipoTurno)[keyof typeof TipoTurno]['valor'];

/* CONDIÇÕES DA ALOCAÇÃO */
export const CondicaoAlocacao = {
  ACEITO: { valor: 'ACEITO', label: 'ACEITO' },
  RECUSADO: { valor: 'RECUSADO', label: 'RECUSADO' },
  AGUARDANDO: { valor: 'AGUARDANDO', label: 'AGUARDANDO' },
  DISPENSADO: { valor: 'DISPENSADO', label: 'DISPENSADO' },
  INDISPONIBILIDADE: { valor: 'INDISPONIBILIDADE', label: 'INDISPONIBILIDADE' },
} as const;

export type CondicaoAlocacaoType =
  (typeof CondicaoAlocacao)[keyof typeof CondicaoAlocacao]['valor'];

/* SITUAÇÕES DA ALOCAÇÃO */
export const SituacaoAlocacao = {
  DISPONIVEL: { valor: 'DISPONIVEL', label: 'DISPONÍVEL' },
  ALOCADO: { valor: 'ALOCADO', label: 'ALOCADO' },
  INDISPONIVEL: { valor: 'INDISPONIVEL', label: 'INDISPONÍVEL' },
  FINALIZADO: { valor: 'FINALIZADO', label: 'FINALIZADO' },
} as const;

export type SituacaoAlocacaoType =
  (typeof SituacaoAlocacao)[keyof typeof SituacaoAlocacao]['valor'];

/* FILTROS DE BUSCA */
export const FiltroAlocacao = {
  TOTAIS: { valor: 'TOTAIS', label: 'TOTAIS' },
  ACEITO: { valor: 'ACEITO', label: 'ACEITO' },
  RECUSADO: { valor: 'RECUSADO', label: 'RECUSADO' },
  AGUARDANDO: { valor: 'AGUARDANDO', label: 'AGUARDANDO' },
  DISPENSADO: { valor: 'DISPENSADO', label: 'DISPENSADO' },
  INDISPONIBILIDADE: { valor: 'INDISPONIBILIDADE', label: 'INDISPONIBILIDADE' },
  DISPONIVEL: { valor: 'DISPONIVEL', label: 'DISPONÍVEL' },
  ALOCADO: { valor: 'ALOCADO', label: 'ALOCADO' },
  INDISPONIVEL: { valor: 'INDISPONIVEL', label: 'INDISPONÍVEL' },
  FINALIZADO: { valor: 'FINALIZADO', label: 'FINALIZADO' },
} as const;

export type FiltroAlocacaoType = (typeof FiltroAlocacao)[keyof typeof FiltroAlocacao]['valor'];

/* CONSTANTE DOS CAMPOS DA ENTIDADE */
export const CamposAlocacaoOperacional: (keyof AlocacaoOperacionalForm)[] = ['operadorId'];

/* CONSTANTE DOS CAMPOS DA ENTIDADE ACEITA APENAS NUMEROS
   (nenhum: todos são seleção de ID ou enum) */
export const CamposAlocacaoOperacionalNumeros: (keyof AlocacaoOperacionalForm)[] = [];

/* CONSTANTE DOS CAMPOS DA ENTIDADE ACEITA APENAS LETRAS */
export const CamposAlocacaoOperacionalLetras: (keyof AlocacaoOperacionalForm)[] = [];

/* CONSTANTE DOS CAMPOS DA ENTIDADE DE DATA
   (não há campo de data nesta entidade) */
export const CamposAlocacaoOperacionalData: (keyof AlocacaoOperacionalForm)[] = [];

/* CONSTANTE DOS CAMPOS DA ENTIDADE LIVRES
   (nenhum campo de texto livre: tudo é seleção) */
export const CamposAlocacaoOperacionalLivres: (keyof AlocacaoOperacionalForm)[] = [];

/* MAPEAMENTO DA ENTIDADE */
export const AlocacaoOperacionalMap = {
  ID: 'id',
  CODIGO: 'codigo',
  OPERADOR_ID: 'operadorId',
  OPERADOR: 'operador',
  GESTOR_ID: 'gestorId',
  GESTOR: 'gestor',
  TAG_ATIVO_ID: 'tagAtivoId',
  TAG_ATIVO: 'tagAtivo',
  TURNO: 'turno',
  CONDICAO: 'condicao',
  SITUACAO: 'situacao',
  STATUS: 'status',
} as const;

/* TIPOS DA ENTIDADE */
export type AlocacaoOperacionalType =
  (typeof AlocacaoOperacionalMap)[keyof typeof AlocacaoOperacionalMap];

/* INICIALIZADOR DO OBJETO SIGNALS DE BUSCA */
export const INICIALIZAR_ALOCACAO_OPERACIONAL_ENTITY = (): AlocacaoOperacionalModel => ({
  id: '',
  codigo: undefined,
  operadorId: undefined,
  operador: undefined,
  gestorId: undefined,
  gestor: undefined,
  tagAtivoId: '',
  tagAtivo: undefined,
  turno: '' as TipoTurnoType,
  alocadoEm: null,
  finalizadoEm: null,
  condicao: '' as CondicaoAlocacaoType,
  situacao: '' as SituacaoAlocacaoType,
  status: undefined,
});

/* INICIALIZADOR DO OBJETO SIGNALS DO FORMULARIO */
export const INICIALIZAR_ALOCACAO_OPERACIONAL_FORMS = (): AlocacaoOperacionalForm => ({
  operadorId: '',
});

/* TIPOS DE FALHAS */
export type ErrorAlocacaoOperacionalType =
  // Operador
  'emptyOperadorId' | null;

/* RETORNO DESCRITIVO DAS FALHAS */
export function getErrorAlocacaoOperacionalMessage(error: ErrorAlocacaoOperacionalType): string {
  switch (error) {
    // ─── operador ───
    case 'emptyOperadorId':
      return 'A operador é obrigatória.';

    default:
      return '';
  }
}

/* MAPEAMENTO DE ESTILIZAÇÃO NAS TABELAS */
export const CLASSE_CONDICAO: Record<CondicaoAlocacaoType, string> = {
  [CondicaoAlocacao.ACEITO.valor]: 'badge-aceito',
  [CondicaoAlocacao.RECUSADO.valor]: 'badge-recusado',
  [CondicaoAlocacao.AGUARDANDO.valor]: 'badge-aguardando',
  [CondicaoAlocacao.DISPENSADO.valor]: 'badge-dispensado',
  [CondicaoAlocacao.INDISPONIBILIDADE.valor]: 'badge-indisponibilidade',
};

export const CLASSE_SITUACAO: Record<SituacaoAlocacaoType, string> = {
  [SituacaoAlocacao.DISPONIVEL.valor]: 'badge-disponivel',
  [SituacaoAlocacao.ALOCADO.valor]: 'badge-alocado',
  [SituacaoAlocacao.INDISPONIVEL.valor]: 'badge-indisponivel',
  [SituacaoAlocacao.FINALIZADO.valor]: 'badge-finalizado',
};
