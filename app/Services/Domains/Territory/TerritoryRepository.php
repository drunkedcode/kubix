<?php

namespace App\Services\Domains\Territory;

use App\Models\Media;
use App\Models\Territory;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Normalizer;

class TerritoryRepository
{
    private function normalizar(?string $texto): ?string
    {
        return $texto
            ? mb_strtolower(trim(preg_replace('/[^\p{L}\p{N}]/u', '', Normalizer::normalize($texto, \Normalizer::NFD))), 'UTF-8')
            : null;
    }

    public function findCountryByName(string $name): ?Territory
    {
        $busqueda = trim($name);

        return Territory::where('type', 'country')
            ->where(function ($q) use ($busqueda) {
                $q->where('name', $busqueda)
                    ->orWhere('code', strtoupper($busqueda));
            })
            ->first();
    }

    public function findStateByName(string $name): ?Territory
    {
        $busqueda = trim($name);

        return Territory::where('type', 'state')
            ->where(function ($q) use ($busqueda) {
                $q->where('name', $busqueda)
                    ->orWhere('code', strtoupper($busqueda));
            })
            ->first();
    }

    public function listStates(?string $countryName = null): array
    {
        if (! $countryName) return [];

        $pais = $this->findCountryByName($countryName);
        if (! $pais) return [];

        return Territory::where('type', 'state')
            ->where('path', 'LIKE', "{$pais->path}/%")
            ->orderBy('name')
            ->pluck('name')
            ->toArray();
    }

    public function filterCountryList(?string $countryName = null, ?string $stateName = null): Collection
    {
        $pais = $countryName ? $this->findCountryByName($countryName) : null;
        $estado = $stateName ? $this->findStateByName($stateName) : null;

        $consulta = Territory::with('parent.parent');

        if ($pais && $estado) {
            $consulta->where('path', 'LIKE', "{$estado->path}/%");
        } elseif ($pais) {
            $consulta->where('path', 'LIKE', "{$pais->path}/%")
                ->where('type', 'state');
        } else {
            $consulta->whereNull('parent_id');
        }

        return $consulta->orderBy('name')->get();
    }

    public function findCityPath(?string $countryName = null, ?string $stateName = null, ?string $cityName = null): ?string
    {
        $paisBusca = $this->normalizar($countryName);
        $estadoBusca = $this->normalizar($stateName);
        $ciudadBusca = $this->normalizar($cityName);

        if (!$paisBusca) return null;

        $pais = Territory::where('type', 'country')
            ->where(function ($q) use ($paisBusca) {
                $q->whereRaw('LOWER(TRIM(name)) = ?', [$paisBusca])
                    ->orWhereRaw('UPPER(TRIM(code)) = ?', [strtoupper($paisBusca)]);
            })
            ->first();

        if (!$pais) return null;
        if (!$estadoBusca) return $pais->path;

        $estado = Territory::where('type', 'state')
            ->where('parent_id', $pais->id)
            ->where(function ($q) use ($estadoBusca) {
                $q->whereRaw('LOWER(TRIM(name)) = ?', [$estadoBusca])
                    ->orWhereRaw('UPPER(TRIM(code)) = ?', [strtoupper($estadoBusca)]);
            })
            ->first();

        if (!$estado) return $pais->path;
        if (!$ciudadBusca) return $estado->path;

        return Territory::where('type', 'city')
            ->where('parent_id', $estado->id)
            ->whereRaw('LOWER(TRIM(name)) = ?', [$ciudadBusca])
            ->value('path') ?? $estado->path;
    }

    public function markers(?int $parentId = null): array
    {
        return Territory::query()
            ->where('status', 'active')
            ->when($parentId, fn($q) => $q->where('parent_id', $parentId), fn($q) => $q->whereNull('parent_id'))
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->orderBy('name')
            ->get(['id', 'name', 'type', 'code', 'latitude', 'longitude'])
            ->map(fn($t) => [
                'id'       => $t->id,
                'title'    => $t->name,
                'subtitle' => $t->type,
                'lat'      => (float) $t->latitude,
                'lng'      => (float) $t->longitude,
            ])
            ->all();
    }

    public function counts(?int $parentId = null): array
    {
        $base = Territory::query()->where('status', 'active');

        if ($parentId) {
            $parent = Territory::find($parentId);
            if ($parent) {
                $base->where('path', 'like', $parent->path . '/%');
            }
        }

        $byType = (clone $base)->selectRaw('type, count(*) as total')->groupBy('type')->pluck('total', 'type');

        return [
            'countries'     => (int) ($byType['country'] ?? 0),
            'states'        => (int) ($byType['state'] ?? 0),
            'cities'        => (int) ($byType['city'] ?? 0),
            'neighborhoods' => (int) ($byType['neighborhood'] ?? 0),
        ];
    }

    public function operatedCodes(string $type, ?int $parentId = null): array
    {
        return Territory::query()
            ->where('status', 'active')
            ->where('type', $type)
            ->when($parentId, fn($q) => $q->where('parent_id', $parentId))
            ->whereNotNull('code')
            ->pluck('code')
            ->map(fn($c) => (string) $c)
            ->all();
    }

    public function resolveId(string $type, string $name, ?int $parentId = null): ?int
    {
        $busqueda = $this->normalizar($name);
        if (! $busqueda) return null;

        return Territory::query()
            ->where('type', $type)
            ->when($parentId !== null, fn($q) => $q->where('parent_id', $parentId), fn($q) => $q->whereNull('parent_id'))
            ->get(['id', 'name'])
            ->first(fn($t) => $this->normalizar($t->name) === $busqueda)
            ?->id;
    }

    public function operatedNamesUnder(string $type, array $names, ?int $parentId): array
    {
        if ($parentId === null && $type !== 'country') {
            return [];
        }

        $existentes = Territory::query()
            ->where('status', 'active')
            ->where('type', $type)
            ->when($parentId !== null, fn($q) => $q->where('parent_id', $parentId), fn($q) => $q->whereNull('parent_id'))
            ->pluck('name')
            ->map(fn($n) => $this->normalizar($n))
            ->all();

        return collect($names)
            ->filter(fn($n) => in_array($this->normalizar($n), $existentes, true))
            ->values()
            ->all();
    }

    public function findById(int $id): ?Territory
    {
        return Territory::find($id);
    }

    /**
     * Devuelve el territorio si ya existe bajo ese padre, o lo crea.
     * $attrs puede ser un Closure: solo se evalúa si hay que crear
     * (así no se consultan geocoders de más). El path usa el id: nunca se repite.
     */
    public function findOrCreate(string $type, string $name, ?int $parentId, array|\Closure $attrs = []): Territory
    {
        $existingId = $this->resolveId($type, $name, $parentId);
        if ($existingId) {
            return $this->findById($existingId);
        }

        $attrs = $attrs instanceof \Closure ? $attrs() : $attrs;

        // 1. Calculamos la secuencia numérica relativa al padre (el 1er, 2do, 3er hijo de este nodo)
        $siblingCount = Territory::where('parent_id', $parentId)->count();
        $sequence = $siblingCount + 1;

        // 2. Obtenemos el path del padre si existe
        $parent = $parentId ? $this->findById($parentId) : null;

        // 3. Construimos el path numérico relativo (ej: 1/1/1/2)
        $numericPath = $parent
            ? "{$parent->path}/{$sequence}"
            : (string) $sequence;

        return Territory::create(array_merge([
            'parent_id'   => $parentId,
            'type'        => $type,
            'name'        => trim($name),
            'slug'        => Str::slug($name),
            'status'      => 'active',
            'path'        => $numericPath,
        ], $attrs));
    }

    public function neighborhoodExists(int $cityId, string $osmId): bool
    {
        return Territory::where('type', 'neighborhood')
            ->where('parent_id', $cityId)
            ->where('osm_id', $osmId)
            ->exists();
    }

    /**
     * Actualiza el límite de un territorio ya existente (operado o no) y
     * recalcula su centroide. Único punto que toca Eloquent para esto.
     */
    public function updateBoundary(int $id, array $polygon, ?float $lat, ?float $lng): Territory
    {
        $territorio = Territory::findOrFail($id);

        $territorio->update([
            'polygon'   => $polygon,
            'latitude'  => $lat,
            'longitude' => $lng,
        ]);

        return $territorio;
    }

        /**
     * Hijos directos de un territorio (o del nivel raíz si $parentId es null),
     * solo de nuestra DB. Lo usa el Index: ahí no hay geocoders externos.
     */
    public function childrenOf(?int $parentId, string $type): Collection
    {
        return Territory::query()
            ->where('type', $type)
            ->when($parentId !== null, fn ($q) => $q->where('parent_id', $parentId), fn ($q) => $q->whereNull('parent_id'))
            ->orderBy('name')
            ->get();
    }

    /** Ids del territorio y de todos sus descendientes (path materializado: path + '/'). */
    public function subtreeIds(Territory $territory): array
    {
        return Territory::query()
            ->where('id', $territory->id)
            ->orWhere('path', 'like', $territory->path . '/%')
            ->pluck('id')
            ->all();
    }

    /** Guarda la configuración propia del barrio (columna JSON `settings`). */
    public function updateSettings(Territory $territory, array $settings): Territory
    {
        $territory->update(['settings' => $settings]);

        return $territory;
    }

    /** Archivo vigente de una colección del territorio (logo, cover) o null. */
    public function currentMedia(Territory $territory, string $collection): ?Media
    {
        return $territory->media()->where('collection', $collection)->first();
    }

    /** Reemplaza el archivo de una colección: quita el registro anterior y guarda el nuevo. */
    public function replaceMedia(Territory $territory, string $collection, array $file, ?int $userId = null): Media
    {
        $territory->media()->where('collection', $collection)->delete();

        return $territory->attachMedia($file, $collection, $userId);
    }
}
