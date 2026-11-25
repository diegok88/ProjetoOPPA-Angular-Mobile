import { Icone } from '../components/icones/icone.type';

export interface MenuItem {
  rotulo: string;
  icone: Icone;
  caminho?: string;
  chave?: string;
  papeis?: string[];
  children?: MenuItem[];
}
