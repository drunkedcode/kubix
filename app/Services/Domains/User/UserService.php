<?php

namespace App\Services\Domains\User;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserService
{
    public function __construct(
        protected UserRepository $repo,
    ) {}

    public function find(int $id): ?User
    {
        return $this->repo->findById($id);
    }

    /** Crea la cuenta de una persona (hoy: el dueño de un negocio que se registra desde la PWA). */
    public function register(array $data): User
    {
        return $this->repo->create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'phone'    => $data['phone'] ?? null,
            'password' => $data['password'], // el cast 'hashed' del modelo la encripta
        ]);
    }

    /** La persona si las credenciales son correctas; si no, error sin decir cuál de las dos falló. */
    public function authenticate(string $email, string $password): User
    {
        $user = $this->repo->findByEmail($email);

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Credenciales incorrectas.',
            ]);
        }

        return $user;
    }

    /** Token de API para la app (Sanctum). */
    public function issueToken(User $user): string
    {
        return $user->createToken('vi-app')->plainTextToken;
    }

    /** Cierra la sesión de la app: borra el token con el que llegó la petición. */
    public function revokeCurrentToken(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    /** Lo que la app puede ver de la persona. */
    public function profile(User $user): array
    {
        return $user->only('id', 'name', 'email', 'phone');
    }

    /** Código de promotor de la persona; lo crea la primera vez (único, 8 caracteres). */
    public function ensureReferralCode(User $user): string
    {
        if ($user->referral_code) {
            return $user->referral_code;
        }

        do {
            $code = Str::upper(Str::random(8));
        } while ($this->repo->referralCodeExists($code));

        $this->repo->setReferralCode($user, $code);

        return $code;
    }

    public function findByReferralCode(string $code): ?User
    {
        return $this->repo->findByReferralCode($code);
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