<?php

namespace App\Services\Domains\User;

use App\Models\User;

class UserService
{
    public function __construct(
        protected UserRepository $repo,
    ) {}

    public function find(int $id): ?User
    {
        return $this->repo->findById($id);
    }

    /** Búsqueda por correo EXACTO: devuelve solo lo mínimo, con el correo parcialmente tapado. */
    public function lookupByEmail(string $email): ?array
    {
        $user = $this->repo->findByEmail($email);

        if (! $user) {
            return null;
        }

        return [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $this->maskEmail($user->email),
        ];
    }

    private function maskEmail(string $email): string
    {
        [$local, $domain] = explode('@', $email, 2);

        $masked = mb_substr($local, 0, 1)
            . str_repeat('*', max(mb_strlen($local) - 2, 1))
            . mb_substr($local, -1);

        return $masked . '@' . $domain;
    }
}