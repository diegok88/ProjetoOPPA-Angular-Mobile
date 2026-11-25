export interface LoginModel {
  cracha: string;
  senha: string;
  codEmpresa: string;
}

export type CampoLogin = keyof LoginModel;
