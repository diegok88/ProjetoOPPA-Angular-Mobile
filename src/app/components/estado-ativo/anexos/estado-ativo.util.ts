export type EstadoVisual = 'produzindo' | 'parado' | 'falha' | 'sem-estado';

const MAPA: Record<string, EstadoVisual> = {
  PRODUZINDO: 'produzindo',
  PARADA: 'parado',
  FALHA: 'falha',
};

export function classeEstado(tipoEstado?: string | null): EstadoVisual {
  if (!tipoEstado) return 'sem-estado';
  return MAPA[tipoEstado.toUpperCase()] ?? 'sem-estado';
}

export function rotuloEstado(tipoEstado?: string | null): string {
  return tipoEstado?.toUpperCase() || 'SEM ESTADO';
}

/** Ordem de gravidade: falha → parada → produzindo → sem estado */
export function pesoEstado(tipoEstado?: string | null): number {
  switch (classeEstado(tipoEstado)) {
    case 'falha':
      return 0;
    case 'parado':
      return 1;
    case 'produzindo':
      return 2;
    default:
      return 3;
  }
}

export function formatarTempo(segundos: number): string {
  if (!segundos || isNaN(segundos) || segundos < 0) return '00:00';
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = Math.floor(segundos % 60);
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');
  return h > 0 ? `${h.toString().padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`;
}
