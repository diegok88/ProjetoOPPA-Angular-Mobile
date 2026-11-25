export interface DialogoConfirmarData<T = any> {
  icone: string;
  titulo: string;
  entidade?: string;
  mensagem: string;
  dados?: string;
  acao: () => Promise<T> | import('rxjs').Observable<T>;
}

export const CONFIRMAR_CADASTRAR = {
  icone: '/icons/add_circle_84.png',
  titulo: 'Novo',
  mensagem: 'Deseja confirmar o cadastro',
};

export const CONFIRMAR_ATUALIZAR = {
  icone: '/icons/add_circle_84.png',
  titulo: 'Atualizar',
  mensagem: 'Deseja confirmar a atualização',
};

export const CONFIRMAR_CANCELAMENTO = {
  icone: '/icons/add_circle_84.png',
  titulo: 'Cancelar',
  mensagem: 'Deseja confirmar o cancelamento',
};

export const CONFIRMAR_EXECUCAO = {
  icone: '/icons/add_circle_84.png',
  titulo: 'Executar',
  mensagem: 'Deseja confirmar a execução novamente',
};

export const CONFIRMAR_FINALIZAR = {
  icone: '/icons/add_circle_84.png',
  titulo: 'Finalizar',
  mensagem: 'Deseja confirmar a finalização',
};

export const CONFIRMAR_ATIVAR = {
  icone: '/icons/add_circle_84.png',
  titulo: 'Ativar',
  mensagem: 'Deseja confirmar a ativação',
};

export const CONFIRMAR_INATIVAR = {
  icone: '/icons/add_circle_84.png',
  titulo: 'Inativar',
  mensagem: 'Deseja confirmar o inativação',
};

export const CONFIRMAR_INDISPONIVEL = {
  icone: '/icons/add_circle_84.png',
  titulo: 'Indisponibilizar',
  mensagem: 'Deseja confirmar o indisponilidade',
};

export const CONFIRMAR_ELIMINAR = {
  icone: '/icons/add_circle_84.png',
  titulo: 'Eliminar',
  mensagem: 'Deseja confirmar o eliminação',
};
