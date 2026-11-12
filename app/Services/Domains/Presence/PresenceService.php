<?php

namespace App\Services\Domains\Presence;

use App\Models\Territory;
use Throwable;

/**
 * Quién está online en un barrio. Cuenta como online quien tuvo actividad en los
 * últimos 5 minutos. Se distingue por dónde actúa: el equipo usa el admin (TEAM) y
 * los usuarios de la app usan la API (APP).
 */
class PresenceService
{
    public const TEAM = 'team';
    public const APP  = 'app';

    /** Segundos que cuenta como "online" la última actividad. */
    private const WINDOW = 300;

    public function __construct(
        protected PresenceRepository $repo,
    ) {}

    /** Registra actividad de la persona en el barrio. Si Redis falla, no rompe la petición. */
    public function touch(Territory $territory, int $userId, string $kind): void
    {
        try {
            $this->repo->touch($territory->id, $kind, $userId, now()->timestamp, self::WINDOW);
        } catch (Throwable $e) {
            report($e);
        }
    }

    /** Online ahora en el barrio: totales, y los nombres del equipo. */
    public function online(Territory $territory): array
    {
        $since = now()->timestamp - self::WINDOW;
        $team  = $this->repo->onlineIds($territory->id, self::TEAM, $since);
        $app   = $this->repo->onlineIds($territory->id, self::APP, $since);

        return [
            'total'  => count(array_unique([...$team, ...$app])),
            'team'   => count($team),
            'app'    => count($app),
            'people' => $this->repo->namesOf($team),
        ];
    }
}
