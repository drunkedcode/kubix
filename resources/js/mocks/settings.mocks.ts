// resources/js/mocks/settings.mocks.ts
import type { AddressData } from '@/Shared/ui/forms/AddressFields';

export const SETTINGS_MOCK = {
    name: 'Batel',
    level: 'neighborhood',
    email: 'batel@kubix.com',
    phone: '41999998888',
    address: {
        cep: '80420090',
        street: 'Av. Batel',
        number: '1230',
        complement: '',
        neighborhood: 'Batel',
        city: 'Curitiba',
        state: 'PR',
    } as AddressData,
};

export const LEVEL_OPTIONS_MOCK = [
    { value: 'neighborhood', label: 'Barrio' },
    { value: 'city', label: 'Ciudad' },
    { value: 'state', label: 'Estado' },
    { value: 'country', label: 'País' },
];