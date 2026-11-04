<?php

namespace App\Services\Domains\Territory;

use App\Models\Territory;
use App\Models\User;
use App\Services\Domains\Membership\MembershipService;

class TerritoryScopeService
{
    private const LEVELS = ['country', 'state', 'city', 'neighborhood'];

    public function __construct(
        protected TerritoryRepository $repo,
        protected MembershipService $memberships,
    ) {}

    /**
     * Selector de scope del header, según quién sos.
     * Arranca en el nivel más alto que el usuario tiene asignado (el super admin, en País)
     * y baja por la muñeca rusa. Los valores son slugs (rutas /{territory}/...).
     *
     * @return array{all: ?string, levels: array}|null
     */
    public function forUser(User $user, bool $isSuperAdmin, ?Territory $current): ?array
    {
        $roots = $isSuperAdmin
            ? $this->repo->childrenOf(null, 'country')
            : $this->memberships->territoriesOf($user);

        if ($roots->isEmpty()) {
            return null;
        }

        // Nivel donde arranca el selector = el más alto que tiene asignado.
        $startIndex = $roots->map(fn ($t) => array_search($t->type, self::LEVELS, true))->min();
        $roots      = $roots->where('type', self::LEVELS[$startIndex])->values();

        $chain    = $this->chainOf($current);
        $levels   = [];
        $parentId = null;
        $open     = true; // un nivel muestra opciones solo si el anterior ya está elegido

        foreach (array_slice(self::LEVELS, $startIndex) as $i => $type) {
            $options = $i === 0
                ? $roots
                : ($open ? $this->repo->childrenOf($parentId, $type) : collect());

            $selected = $chain[$type] ?? null;

            // En el primer nivel solo cuenta si es parte de lo que el usuario gestiona.
            if ($i === 0 && $selected && ! $roots->contains('id', $selected->id)) {
                $selected = null;
            }

            $levels[] = [
                'type'     => $type,
                'selected' => $selected?->slug,
                'options'  => $options
                    ->map(fn ($t) => ['value' => $t->slug, 'label' => $t->name])
                    ->values()
                    ->all(),
            ];

            $open     = $selected !== null;
            $parentId = $selected?->id;
        }

        return [
            // Qué significa "Todos" en el primer nivel: vista global (super admin) u overview (gerente con 2+).
            'all'    => $isSuperAdmin ? 'platform' : ($roots->count() > 1 ? 'overview' : null),
            'levels' => $levels,
        ];
    }

    /** Ancestros del territorio actual (incluido él mismo), indexados por nivel. */
    private function chainOf(?Territory $current): array
    {
        $chain = [];
        $node  = $current;

        while ($node) {
            $chain[$node->type] = $node;
            $node = $node->parent_id ? $this->repo->findById($node->parent_id) : null;
        }

        return $chain;
    }
}