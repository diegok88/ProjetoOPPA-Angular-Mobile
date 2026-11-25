export const Escalas = { A: 'A', B: 'B', C: 'C', D: 'D' } as const;

export type EscalaType = (typeof Escalas)[keyof typeof Escalas];

export interface GeradorEscalaModel {
  data: string;
  escala: EscalaType;
  posicaoNoCiclo: number;
  dataReferencia: string;
}
