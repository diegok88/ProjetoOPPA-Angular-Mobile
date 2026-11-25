export interface DialogoFinalizarData {
  icone: string;
  titulo: string;
  operacao?: string;
  dados?: string;
  mensagem: string;
  erros?: string[];
}

export const FINALIZAR_SUCESSO: DialogoFinalizarData = {
  icone: '/icons/check_circle_84.png',
  titulo: 'Sucesso!',
  mensagem: 'Operação realizada com êxito.',
};

export const FINALIZAR_ERRO: DialogoFinalizarData = {
  icone: '/icons/error_84.png',
  titulo: 'Erro!',
  mensagem: 'Falha na realização da operação.',
};

export const FINALIZAR_CANCELAR: DialogoFinalizarData = {
  icone: '/icons/cancel_84.png',
  titulo: 'Cancelado!',
  mensagem: 'Operação cancelada.',
};

export const FINALIZAR_ERRO_FORM: DialogoFinalizarData = {
  icone: '/icons/error_84.png',
  titulo: 'Erro!',
  mensagem: 'Formulário inválido, verifique.',
};

export const FINALIZAR_ERRO_ALT: DialogoFinalizarData = {
  icone: '/icons/error_84.png',
  titulo: 'Erro!',
  mensagem: 'Formulário sem alteração, verifique.',
};

export const FINALIZAR_ERRO_ACT: DialogoFinalizarData = {
  icone: '/icons/error_84.png',
  titulo: 'Erro!',
  mensagem: 'Registro está ativo, verifique.',
};

export const FINALIZAR_ERRO_FIN: DialogoFinalizarData = {
  icone: '/icons/error_84.png',
  titulo: 'Erro!',
  mensagem: 'Registro está finalizado, verifique.',
};

export const FINALIZAR_ALERTA: DialogoFinalizarData = {
  icone: '/icons/error_84.png',
  titulo: 'Alerta!',
  mensagem: 'Operação possui registros cadastrados, verifique.',
};
