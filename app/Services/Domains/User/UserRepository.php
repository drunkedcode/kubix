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

    public function create(array $attrs): User
    {
        return User::create($attrs);
    }

    public function findByReferralCode(string $code): ?User
    {
        return User::where('referral_code', $code)->first();
    }

    public function referralCodeExists(string $code): bool
    {
        return User::where('referral_code', $code)->exists();
    }

    public function setReferralCode(User $user, string $code): void
    {
        $user->update(['referral_code' => $code]);
    }
}
