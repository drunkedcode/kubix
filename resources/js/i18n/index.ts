import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt_BR from './locales/pt_BR';
import es from './locales/es';

const STORAGE_KEY = 'nexo-language';

const resources = {
    pt_BR: { translation: pt_BR },
    es: { translation: es },
} as const;

const savedLanguage = localStorage.getItem(STORAGE_KEY) ?? 'pt_BR';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage,
        fallbackLng: 'pt_BR',
        interpolation: {
            escapeValue: false,
        },
    })
    .then(() => {
        console.log('i18n iniciado correctamente');
        console.log('Idioma:', i18n.language);
        console.log('Recursos:', Object.keys(resources));
    })
    .catch((error) => {
        console.error('Error al iniciar i18n:', error);
    });

i18n.on('languageChanged', (lng) => {
    localStorage.setItem(STORAGE_KEY, lng);
    console.log(`Idioma cambiado a: ${lng}`);
});

export default i18n;