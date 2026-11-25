export interface TagAtivoListagemModel {
  id: string;
  codigo: number;
  descricao: string;
  ativo: {
    id: string;
    descricao: string;
    modelo: string | null;
    setorId: string;
  } | null;
}

export interface EstadoAtivoListagemModel {
  id: string;
  codigo: number;
  alocacaoId: string;
  tagAtivoId: string;
  tipoEstado: string;
  dataInicial: string | Date;
  dataFinal: string | Date | null;
  duracao: number | null;
  status: boolean;
  tagAtivo?: TagAtivoListagemModel | null;
  alocacaoOperacional?: {
    operador?: { id: string; cracha: string; nome: string } | null;
    gestor?: { id: string; cracha: string; nome: string } | null;
  } | null;
}

/** Payload de estadoAtivoTrocado / cronometroTick (agora com setorId) */
export interface EstadoTrocado {
  ativo: string;
  anterior: EstadoAtivoListagemModel | null;
  atual: EstadoAtivoListagemModel;
  setorId: string | null;
}

export interface CronometroTick {
  ativo: string;
  id: string;
  tipoEstado: string;
  tempo: number;
  setorId: string | null;
}

export interface SetorCompetenciaModel {
  setorId: string;
  codigo: number;
  descricao: string;
  turno: string;
  totalAtivos: number;
  produzindo: number;
  parado: number;
  falha: number;
}

export interface ResumoSetor {
  total: number;
  produzindo: number;
  parado: number;
  falha: number;
}
