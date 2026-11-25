import { TurnoType } from './usuario.model';

export interface CompetenciaSetorialModel {
  id?: string;
  codigo: number;
  colaboradorId: string;
  gestorId?: string;
  setorId: string;
  setor?: { id: string; codigo: number; descricao: string };
  turno?: TurnoType;
  status?: boolean;
}

export interface CompetenciaSetorialTagsModel {
  id: string;
  codigo: number;
  descricao: string;
  desAtivo: string;
}

export interface CompetenciaSetorialContadorSupModel {
  total: number;
}

export interface CompetenciaSetorialQuery {
  colaboradorId?: string;
  gestorId?: string;
  setorId?: string;
  turno?: TurnoType;
  status?: boolean;
  gestor?: boolean;
}
