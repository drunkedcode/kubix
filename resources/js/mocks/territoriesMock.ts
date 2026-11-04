export interface BarrioMock {
    id: number;
    name: string;
    centroid: [number, number]; // [lat, lng] de Overpass
    existsInDb: boolean;         // True si ya está conquistado en TerritoryRepository
}

export interface CityMock {
    id: string;
    name: string;
    center: [number, number];
    zoom: number;
    barrios: BarrioMock[];
}

export interface StateMock {
    id: string;
    name: string;
    cities: CityMock[];
}

export interface CountryMock {
    id: string;
    name: string;
    states: StateMock[];
}

export const TERRITORIES_MOCK: CountryMock[] = [
    {
        id: 'BR',
        name: 'Brasil',
        states: [
            {
                id: 'PR',
                name: 'Paraná (PR)',
                cities: [
                    {
                        id: 'curitiba',
                        name: 'Curitiba',
                        center: [-25.4284, -49.2733],
                        zoom: 12,
                        barrios: [
                            { id: 1, name: 'Batel', centroid: [-25.4431, -49.2905], existsInDb: true },
                            { id: 2, name: 'Centro', centroid: [-25.4284, -49.2733], existsInDb: true },
                            { id: 3, name: 'Bigorrilho', centroid: [-25.4350, -49.2980], existsInDb: false },
                            { id: 4, name: 'Santa Felicidade', centroid: [-25.3950, -49.3320], existsInDb: false },
                            { id: 5, name: 'Água Verde', centroid: [-25.4550, -49.2850], existsInDb: true },
                            { id: 6, name: 'Juvevê', centroid: [-25.4160, -49.2620], existsInDb: false },
                            { id: 7, name: 'Mercês', centroid: [-25.4190, -49.2850], existsInDb: true },
                            { id: 8, name: 'Ahú', centroid: [-25.3980, -49.2650], existsInDb: false },
                            { id: 9, name: 'Cabral', centroid: [-25.4050, -49.2550], existsInDb: true },
                            { id: 10, name: 'Ecoville', centroid: [-25.4450, -49.3350], existsInDb: false },
                        ],
                    },
                    {
                        id: 'londrina',
                        name: 'Londrina',
                        center: [-23.3045, -51.1696],
                        zoom: 13,
                        barrios: [
                            { id: 11, name: 'Centro', centroid: [-23.3045, -51.1696], existsInDb: true },
                            { id: 12, name: 'Gleba Palhano', centroid: [-23.3250, -51.1750], existsInDb: false },
                            { id: 13, name: 'Jardim Higienópolis', centroid: [-23.3120, -51.1550], existsInDb: false },
                            { id: 14, name: 'San Remo', centroid: [-23.2900, -51.1800], existsInDb: true },
                        ],
                    },
                    {
                        id: 'maringa',
                        name: 'Maringá',
                        center: [-23.4209, -51.9331],
                        zoom: 13,
                        barrios: [
                            { id: 15, name: 'Zona 01 (Centro)', centroid: [-23.4209, -51.9331], existsInDb: true },
                            { id: 16, name: 'Zona 07', centroid: [-23.4080, -51.9450], existsInDb: true },
                            { id: 17, name: 'Zona 03', centroid: [-23.4300, -51.9250], existsInDb: false },
                        ],
                    },
                ],
            },
            {
                id: 'SP',
                name: 'São Paulo (SP)',
                cities: [
                    {
                        id: 'sao-paulo',
                        name: 'São Paulo',
                        center: [-23.5505, -46.6333],
                        zoom: 11,
                        barrios: [
                            { id: 18, name: 'Paulista', centroid: [-23.5615, -46.6560], existsInDb: true },
                            { id: 19, name: 'Pinheiros', centroid: [-23.5670, -46.6920], existsInDb: false },
                            { id: 20, name: 'Vila Madalena', centroid: [-23.5550, -46.6880], existsInDb: true },
                            { id: 21, name: 'Moema', centroid: [-23.5950, -46.6650], existsInDb: false },
                            { id: 22, name: 'Itaim Bibi', centroid: [-23.5850, -46.6800], existsInDb: true },
                        ],
                    },
                    {
                        id: 'campinas',
                        name: 'Campinas',
                        center: [-22.9056, -47.0608],
                        zoom: 12,
                        barrios: [
                            { id: 23, name: 'Cambuí', centroid: [-22.8980, -47.0550], existsInDb: true },
                            { id: 24, name: 'Barão Geraldo', centroid: [-22.8250, -47.0850], existsInDb: false },
                            { id: 25, name: 'Taquaral', centroid: [-22.8750, -47.0650], existsInDb: true },
                        ],
                    },
                    {
                        id: 'santos',
                        name: 'Santos',
                        center: [-23.9608, -46.3336],
                        zoom: 13,
                        barrios: [
                            { id: 26, name: 'Gonzaga', centroid: [-23.9650, -46.3380], existsInDb: true },
                            { id: 27, name: 'Boqueirão', centroid: [-23.9680, -46.3450], existsInDb: false },
                            { id: 28, name: 'Ponta da Praia', centroid: [-23.9820, -46.3050], existsInDb: false },
                        ],
                    },
                ],
            },
            {
                id: 'RJ',
                name: 'Rio de Janeiro (RJ)',
                cities: [
                    {
                        id: 'rio-de-janeiro',
                        name: 'Rio de Janeiro',
                        center: [-22.9068, -43.1729],
                        zoom: 11,
                        barrios: [
                            { id: 29, name: 'Copacabana', centroid: [-22.9647, -43.1823], existsInDb: true },
                            { id: 30, name: 'Ipanema', centroid: [-22.9841, -43.2045], existsInDb: true },
                            { id: 31, name: 'Leblon', centroid: [-22.9838, -43.2205], existsInDb: false },
                            { id: 32, name: 'Barra da Tijuca', centroid: [-23.0004, -43.3659], existsInDb: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 'CO',
        name: 'Colombia',
        states: [
            {
                id: 'ANT',
                name: 'Antioquia',
                cities: [
                    {
                        id: 'medellin',
                        name: 'Medellín',
                        center: [6.2442, -75.5812],
                        zoom: 12,
                        barrios: [
                            { id: 33, name: 'El Poblado', centroid: [6.2085, -75.5658], existsInDb: true },
                            { id: 34, name: 'Laureles', centroid: [6.2485, -75.5925], existsInDb: true },
                            { id: 35, name: 'Envigado', centroid: [6.1691, -75.5857], existsInDb: false },
                            { id: 36, name: 'Belen', centroid: [6.2230, -75.6020], existsInDb: false },
                        ],
                    },
                ],
            },
            {
                id: 'CUN',
                name: 'Cundinamarca',
                cities: [
                    {
                        id: 'bogota',
                        name: 'Bogotá',
                        center: [4.7110, -74.0721],
                        zoom: 11,
                        barrios: [
                            { id: 37, name: 'Usaquén', centroid: [4.7020, -74.0320], existsInDb: true },
                            { id: 38, name: 'Chapinero', centroid: [4.6482, -74.0623], existsInDb: true },
                            { id: 39, name: 'Teusaquillo', centroid: [4.6380, -74.0830], existsInDb: false },
                            { id: 40, name: 'Santa Fe', centroid: [4.6097, -74.0707], existsInDb: false },
                        ],
                    },
                ],
            },
            {
                id: 'VAC',
                name: 'Valle del Cauca',
                cities: [
                    {
                        id: 'cali',
                        name: 'Cali',
                        center: [3.4516, -76.5320],
                        zoom: 12,
                        barrios: [
                            { id: 41, name: 'San Fernando', centroid: [3.4350, -76.5450], existsInDb: true },
                            { id: 42, name: 'Granada', centroid: [3.4620, -76.5350], existsInDb: false },
                            { id: 43, name: 'El Peñón', centroid: [3.4470, -76.5400], existsInDb: true },
                        ],
                    },
                ],
            },
        ],
    },
];