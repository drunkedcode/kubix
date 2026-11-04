import auth from './auth';
import layout from './layout';
import shared from './shared';

export default {
    auth,
    layout,
    shared,

    homeTitle: 'Suas Empresas',
    homeSubtitle: 'Kubix reúne negócios de todos os setores perto de você',
    filter: 'Filtrar empresas...',
    noResults: 'Nenhuma empresa encontrada.',
    noFollowed: 'Você ainda não segue nenhuma empresa.',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    save: 'Salvar',
    loading: 'Carregando...',
} as const;

