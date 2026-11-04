<?php

namespace App\Services\Domains\User;

use App\Models\User;

class UserRepository
{
    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', mb_strtolower(trim($email)))->first();
    }
}