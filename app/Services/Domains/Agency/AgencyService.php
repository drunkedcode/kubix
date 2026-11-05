<?php

namespace App\Services\Domains\Agency;

use App\Models\Territory;
use App\Services\Domains\Business\BusinessService;
use App\Services\Domains\Territory\TerritoryService;
use App\Services\Domains\Utils\MediaUploader;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;

/**
 * La "agencia" de un barrio es el propio barrio: este servicio arma su portada
 * (General y Evolución) y su configuración propia (nombre público, colores, logo...).
 * Los totalizadores viven en OverviewService.
 */
class AgencyService
{
    private const SETTING_KEYS = ['public_name', 'tagline', 'primary_color', 'secondary_color', 'contact_email', 'contact_phone', 'address'];
    private const ADDRESS_KEYS = ['cep', 'street', 'number', 'complement', 'neighborhood', 'city', 'state'];
    private const IMAGES       = ['logo', 'cover'];

    public function __construct(
        protected BusinessService $businesses,
        protected TerritoryService $territories,
        protected MediaUploader $uploader,
    ) {}

    public function home(Territory $territory): array
    {
        $businesses = $this->businesses->listForTerritory($territory->id);
        $trend      = $this->businesses->trendForTerritories([$territory->id]);

        return [
            'general' => [
                'stats'    => $this->stats($businesses->count()),
                'markers'  => $this->businesses->toMarkers($businesses),
                'areas'    => $territory->polygon
                    ? [['id' => $territory->id, 'name' => $territory->name, 'geometry' => $territory->polygon]]
                    : [],
                'segments' => $this->segments(),
            ],
            'evolution' => [
                'trend'   => $trend,
                'summary' => $this->businesses->trendSummary($trend),
                'recent'  => $this->businesses->recentForTerritories([$territory->id]),
            ],
            'settings' => $this->settings($territory),
        ];
    }

    /** Configuración propia del barrio; lo no definido va null (la PWA usa los valores por defecto de Kubix). */
    public function settings(Territory $territory): array
    {
        $saved = $territory->settings ?? [];

        return [
            'name'            => $territory->name,
            'public_name'     => $saved['public_name'] ?? null,
            'tagline'         => $saved['tagline'] ?? null,
            'primary_color'   => $saved['primary_color'] ?? null,
            'secondary_color' => $saved['secondary_color'] ?? null,
            'contact_email'   => $saved['contact_email'] ?? null,
            'contact_phone'   => $saved['contact_phone'] ?? null,
            'address'         => array_merge(array_fill_keys(self::ADDRESS_KEYS, null), $saved['address'] ?? []),
            'logo_url'        => $this->territories->currentMedia($territory, 'logo')?->url(),
            'cover_url'       => $this->territories->currentMedia($territory, 'cover')?->url(),
        ];
    }

    /** Guarda los campos y, si vienen, reemplaza logo y/o portada. El territorio lo decide la URL, nunca el formulario. */
    public function updateSettings(Territory $territory, array $data, array $files = [], ?int $userId = null): void
    {
        $settings            = Arr::only($data, self::SETTING_KEYS);
        $settings['address'] = Arr::only($settings['address'] ?? [], self::ADDRESS_KEYS);

        $this->territories->updateSettings($territory, $settings);

        foreach (self::IMAGES as $collection) {
            $file = $files[$collection] ?? null;

            if (! $file instanceof UploadedFile) {
                continue;
            }

            $old    = $this->territories->currentMedia($territory, $collection);
            $stored = $this->uploader->replace($old?->path, $file, 'images', "territories/{$territory->id}/{$collection}");

            $this->territories->replaceMedia($territory, $collection, $stored, $userId);
        }
    }

    private function stats(int $registered): array
    {
        return [
            ['label' => 'Negocios registrados', 'value' => $registered, 'icon' => 'building', 'tone' => 'teal',  'trend' => 12], // MOCK: trend
            ['label' => 'Al día',               'value' => 31,  'icon' => 'star',     'tone' => 'teal',  'trend' => 8],  // MOCK
            ['label' => 'Por vencer',           'value' => 10,  'icon' => 'contrast', 'tone' => 'amber', 'trend' => -3], // MOCK
            ['label' => 'Vencidos',             'value' => 7,   'icon' => 'flame',    'tone' => 'rose',  'trend' => 5],  // MOCK
            ['label' => 'Onlines',              'value' => 150, 'icon' => 'flame',    'tone' => 'teal',  'trend' => 80], // MOCK
        ];
    }

    // MOCK: pendiente de la columna real de categoría/segmento
    private function segments(): array
    {
        return [
            ['label' => 'Restaurantes', 'count' => 18],
            ['label' => 'Salones',      'count' => 12],
            ['label' => 'Barberías',    'count' => 9],
            ['label' => 'Salud',        'count' => 5],
            ['label' => 'Otros',        'count' => 4],
        ];
    }

    /** Reclamos del barrio agrupados para el submódulo Issues. */
    public function issues(Territory $territory): array
    {
        $issues = collect($this->mockIssues());

        $open     = $issues->where('status', '!=', 'resolved')->values();
        $resolved = $issues->where('status', 'resolved')->values();

        return [
            'summary' => [
                'open'        => $open->count(),
                'resolved'    => $resolved->count(),
                'oldest_days' => (int) $open->max('age_days'),
            ],
            'open'     => $open->all(),
            'resolved' => $resolved->all(),
        ];
    }

    /** MOCK: pasa a leer de la tabla de issues cuando VI empiece a reportarlos. */
    private function mockIssues(): array
    {
        return [
            ['id' => 1, 'title' => 'El mural no carga las fotos nuevas',      'reporter' => 'Ana Souza',    'category' => 'Mural',      'status' => 'new',         'age_days' => 1],
            ['id' => 2, 'title' => 'Negocio duplicado en el directorio',      'reporter' => 'Carlos Lima',  'category' => 'Directorio', 'status' => 'in_progress', 'age_days' => 4],
            ['id' => 3, 'title' => 'No llega la notificación de empleos',     'reporter' => 'Marta Reis',   'category' => 'Empleos',    'status' => 'new',         'age_days' => 6],
            ['id' => 4, 'title' => 'El splash muestra el barrio equivocado',  'reporter' => 'Pedro Alves',  'category' => 'VI',         'status' => 'resolved',    'age_days' => 9],
            ['id' => 5, 'title' => 'Horario incorrecto en una panadería',     'reporter' => 'Julia Nunes',  'category' => 'Directorio', 'status' => 'resolved',    'age_days' => 12],
        ];
    }
}
