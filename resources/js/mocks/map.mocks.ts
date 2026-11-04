import type { MapMarker } from '@/Shared/maps/MarkersLayer';
import type { MapArea } from '@/Shared/maps/DrawLayer';

export const MAP_AREAS_MOCK: MapArea[] = [
    {
        id: 'batel',
        name: 'Batel',
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [-49.2865, -25.4375],
                [-49.2740, -25.4375],
                [-49.2740, -25.4490],
                [-49.2865, -25.4490],
                [-49.2865, -25.4375],
            ]],
        },
    },
    {
        id: 'agua-verde',
        name: 'Água Verde',
        color: '#a78bfa',
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [-49.2865, -25.4490],
                [-49.2740, -25.4490],
                [-49.2740, -25.4610],
                [-49.2865, -25.4610],
                [-49.2865, -25.4490],
            ]],
        },
    },
];

export const MAP_MARKERS_MOCK: MapMarker[] = [
    { id: 1, name: 'Barbearia Premium', category: 'Barbería', lat: -25.4400, lng: -49.2810, opportunity: 'very_high', payment: 'overdue', href: '#' },
    { id: 2, name: 'Espetinhos do Juan', category: 'Restaurante', lat: -25.4450, lng: -49.2770, opportunity: 'very_high', payment: 'pending', href: '#' },
    { id: 3, name: 'Clínica Vitalis', category: 'Salud', lat: -25.4420, lng: -49.2760, opportunity: 'high', payment: 'paid', href: '#' },
    { id: 4, name: 'Tech Soluções', category: 'Tecnología', lat: -25.4530, lng: -49.2820, opportunity: 'high', payment: 'trial', href: '#' },
    { id: 5, name: 'Sabor & Cia', category: 'Restaurante', lat: -25.4570, lng: -49.2780, opportunity: 'medium', payment: 'paid', href: '#' },
    { id: 6, name: 'Studio Belleza', category: 'Belleza', lat: -25.4510, lng: -49.2750, opportunity: 'low', payment: 'paid', href: '#' },
];