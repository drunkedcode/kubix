<?php

namespace App\Services\Domains\User;

use Illuminate\Support\Facades\Cache;

/** Datos volátiles de la persona logueada: viven en Redis y vencen solos. */
class UserContextRepository
{
    public function put(int $userId, int $territoryId, int $minutes): void
    {
        Cache::store('redis')->put($this->key($userId), $territoryId, now()->addMinutes($minutes));
    }

    public function get(int $userId): ?int
    {
        return Cache::store('redis')->get($this->key($userId));
    }

    public function forget(int $userId): void
    {
        Cache::store('redis')->forget($this->key($userId));
    }

    private function key(int $userId): string
    {
        return "user:{$userId}:territory";
    }
}
