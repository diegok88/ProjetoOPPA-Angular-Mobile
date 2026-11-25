import { FiltroHistorico, StatusSolicitacao, TAMANHO_MAXIMO_PAGINA } from './solicitacao.model';

const CONSULTA = 'solicitacao_historico';

export function dataHoje(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
  }).format(new Date());
}

function vazio(valor: unknown): boolean {
  if (valor === undefined || valor === null) return true;
  if (typeof valor === 'string' && valor.trim() === '') return true;
  if (Array.isArray(valor) && valor.length === 0) return true;
  return false;
}

function texto(valor: string): string {
  return valor.trim();
}

export function normalizarFiltroSolicitacoes(
  filtro: FiltroHistorico,
): Record<string, string | number | boolean> {
  const page = Math.max(1, Math.trunc(Number(filtro.page) || 1));

  const size = Math.min(TAMANHO_MAXIMO_PAGINA, Math.max(1, Math.trunc(Number(filtro.size) || 10)));

  const situacoes: StatusSolicitacao[] = filtro.situacoes?.length
    ? filtro.situacoes
    : filtro.situacao
      ? [filtro.situacao]
      : [];

  const hoje = dataHoje();

  const pares: Record<string, string | number | boolean | undefined | null> = {
    consulta: CONSULTA,

    solicitanteId: texto(filtro.solicitanteId),
    solicitadoId: texto(filtro.solicitadoId),
    tagAtivoId: texto(filtro.tagAtivoId),
    tipoSolicitacaoId: texto(filtro.tipoSolicitacaoId),

    situacao: situacoes.length === 1 ? situacoes[0] : undefined,
    situacoes: situacoes.length > 1 ? situacoes.join(',') : undefined,

    busca: texto(filtro.busca),

    caixa: filtro.caixa,
    desvios: filtro.desvios,

    dataEnvio: hoje,
    dataEnvioAte: hoje,

    dataVisualizacao: texto(filtro.dataVisualizacao),
    dataResposta: texto(filtro.dataResposta),

    apenasNaoVisualizadas: filtro.apenasNaoVisualizadas || undefined,
    apenasComResposta: filtro.apenasComResposta || undefined,

    ordenarPor: filtro.ordenarPor,
    ordem: filtro.ordem,

    page,
    size,
  };

  const saida: Record<string, string | number | boolean> = {};

  for (const [chave, valor] of Object.entries(pares)) {
    if (vazio(valor)) continue;
    saida[chave] = typeof valor === 'boolean' ? valor : String(valor).trim();
  }

  return saida;
}

export function buildSolicitacoesPayload(
  filtro: FiltroHistorico,
): Record<string, string | number | boolean> {
  return normalizarFiltroSolicitacoes(filtro);
}
