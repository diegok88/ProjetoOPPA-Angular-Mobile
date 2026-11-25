export interface Contador {
  total: number;
  ativos: number;
  inativos: number;
}

export interface ContadorPenalidade {
  total: number;
  pendente: number;
  cancelada: number;
  execucao: number;
  finalizada: number;
  orientacao: number;
  advertencia: number;
  suspensao: number;
}

export interface ContadorDispensas {
  total: number;
  pendente: number;
  execucao: number;
  cancelada: number;
  finalizada: number;
  atestado: number;
  bancoDeHoras: number;
  ferias: number;
}

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
