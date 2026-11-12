<?php

namespace App\Services\Domains\Presence;

use App\Models\User;
use Illuminate\Support\Facades\Redis;

/** Quién estuvo activo hace poco en cada barrio: un conjunto ordenado en Redis (persona => última actividad). */
class PresenceRepository
{
    /** Marca a la persona como activa ahora y limpia a quienes ya vencieron. */
    public function touch(int $territoryId, string $kind, int $userId, int $now, int $window): void
    {
        $key = $this->key($territoryId, $kind);

        Redis::zadd($key, $now, $userId);
        Redis::zremrangebyscore($key, '-inf', $now - $window);
        Redis::expire($key, $window * 2);
    }

    /** Ids de las personas con actividad desde ese momento. */
    public function onlineIds(int $territoryId, string $kind, int $since): array
    {
        return array_map('intval', Redis::zrangebyscore($this->key($territoryId, $kind), $since, '+inf'));
    }

    /** Nombre de cada persona: [{id, name}], ordenado por nombre. */
    public function namesOf(array $userIds): array
    {
        return User::whereIn('id', $userIds)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (User $user) => ['id' => $user->id, 'name' => $user->name])
            ->all();
    }

    private function key(int $territoryId, string $kind): string
    {
        return "presence:{$territoryId}:{$kind}";
    }
}
