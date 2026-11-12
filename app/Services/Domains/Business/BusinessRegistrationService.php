<?php

namespace App\Services\Domains\Business;

use App\Models\User;
use App\Services\Domains\Agency\AgencyService;
use App\Services\Domains\Location\LocationService;
use App\Services\Domains\Payment\PaymentService;
use App\Services\Domains\Territory\TerritoryService;
use App\Services\Domains\User\UserService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Receta del asistente "Cadastrar negócio" de la PWA: un método por paso del dueño
 * (registrar y pagar). La lógica vive en los servicios que llama.
 */
class BusinessRegistrationService
{
    public function __construct(
        protected BusinessService $businesses,
        protected BusinessShowService $show,
        protected LocationService $locations,
        protected UserService $users,
        protected TerritoryService $territories,
        protected AgencyService $agency,
        protected PaymentService $payments,
    ) {}

    /** Registra el negocio en standby con $owner como dueño; devuelve el negocio, su barrio y los precios del barrio. */
    public function register(User $owner, array $data): array
    {
        $territoryId = $this->locations->territoryFor(
            (float) $data['location']['latitude'],
            (float) $data['location']['longitude'],
        );

        if ($territoryId === null) {
            throw ValidationException::withMessages([
                'location' => 'VI ainda não chegou a esse endereço.',
            ]);
        }

        $referrer = null;

        if (! empty($data['referral_code'])) {
            $referrer = $this->users->findByReferralCode($data['referral_code']);

            if (! $referrer) {
                throw ValidationException::withMessages([
                    'referral_code' => 'Código de promotor inválido.',
                ]);
            }
        }

        $business = DB::transaction(function () use ($owner, $data, $referrer) {
            $business = $this->businesses->register([...$data, 'referred_by' => $referrer?->id], $owner->id)['business'];

            $this->businesses->addOwner($business, $owner->id);

            return $business;
        });

        $territory = $this->territories->find($territoryId);

        return [
            'business'  => $this->show->profile($business),
            'territory' => ['id' => $territory->id, 'name' => $territory->name],
            'prices'    => $this->agency->settings($territory),
        ];
    }

    /** El dueño paga el onboarding: pago simulado y el negocio queda activo. */
    public function pay(User $owner, int $businessId, string $method): array
    {
        $business = $this->businesses->find($businessId);

        abort_if(! $business, 404);
        abort_unless($this->businesses->isOwner($owner, $business), 403);

        $payment = $this->payments->pay($business, 'onboarding', $method);

        return [
            'payment'  => $this->payments->toApi($payment),
            'business' => $this->show->profile($business),
        ];
    }
}
