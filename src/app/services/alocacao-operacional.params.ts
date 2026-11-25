import { HttpParams } from '@angular/common/http';
import { AlocacaoOperacionalSolicitacaoQuery } from '../entities/alocacao-operacional.model';

export function buildAlocacaoOperacionalParams(
  query: AlocacaoOperacionalSolicitacaoQuery,
): HttpParams {
  let params = new HttpParams();

  const pares: Record<string, string | number | boolean | undefined | null> = {
    gestorId: query.gestorId,
    tagAtivoId: query.tagAtivoId,
    situacao: query.situacao,
  };

  for (const [chave, valor] of Object.entries(pares)) {
    if (valor === undefined || valor === null || valor === '') continue;
    params = params.set(chave, String(valor));
  }

  return params;
}
