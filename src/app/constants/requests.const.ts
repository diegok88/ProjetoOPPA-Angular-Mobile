import { environment } from './environment.const';

export const RequestHttp = {
  auth: `${environment.apiUrl}/auth`,
  gerador_escala: `${environment.apiUrl}/gerador-escala`,
  perfil: `${environment.apiUrl}/perfil`,
  competencia_setorial: `${environment.apiUrl}/competencia-setorial`,
  competencia_operacional: `${environment.apiUrl}/competencia-operacional`,
  gestor: `${environment.apiUrl}/gestor`,
  alocacao_operacional: `${environment.apiUrl}/alocacao`,
  usuario: `${environment.apiUrl}/usuario`,
  solicitacoes: `${environment.apiUrl}/solicitacoes`,
};

/*
  competencia_setorial: `${environment.apiUrl}/competencia-setorial`,
  dispensas: 'http://localhost:3000/dispensas',
  penalidades: 'http://localhost:3000/penalidades',
  perfil: 'http://localhost:3000/perfil',
  empresa: 'http://localhost:3000/empresa',
  setor: 'http://localhost:3000/setores',
  falhas: 'http://localhost:3000/falhas',
  solucoes: 'http://localhost:3000/solucoes',
  ativos: 'http://localhost:3000/ativo',
  tag_ativo: 'http://localhost:3000/tag-ativo',
  auditoria: 'http://localhost:3000/auditoria',

*/
