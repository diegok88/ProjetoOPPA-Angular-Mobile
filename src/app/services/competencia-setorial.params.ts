import { HttpParams } from '@angular/common/http';
import { CompetenciaSetorialQuery } from '../entities/competencia-setorial.model';

export function buildCompetenciaSetorialParams(query: CompetenciaSetorialQuery): HttpParams {
  let params = new HttpParams();

  const pares: Record<string, string | number | boolean | undefined | null> = {
    colaboradorId: query.colaboradorId,
    gestorId: query.gestorId,
    setorId: query.setorId,
    turno: query.turno,
    status: query.status,
    gestor: query.gestor,
  };

  for (const [chave, valor] of Object.entries(pares)) {
    if (valor === undefined || valor === null || valor === '') continue;
    params = params.set(chave, String(valor));
  }

  return params;
}
