<?php

namespace App\Http\Requests\Api;

use App\Enums\BusinessSegment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterBusinessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // el acceso lo controla auth:sanctum de la ruta
    }

    protected function prepareForValidation(): void
    {
        $phone = preg_replace('/\D/', '', (string) $this->input('phone'));
        $code  = strtoupper(trim((string) $this->input('referral_code')));

        $this->merge([
            'document'      => preg_replace('/\D/', '', (string) $this->input('document')),
            'phone'         => $phone !== '' ? $phone : null,
            'referral_code' => $code !== '' ? $code : null,
        ]);
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:255'],
            'segment'  => ['required', Rule::enum(BusinessSegment::class)],
            'document' => ['required', 'regex:/^(\d{11}|\d{14})$/'], // CPF (11) o CNPJ (14)
            'phone'    => ['nullable', 'string', 'max:20'],

            // Personalización elegida en la PWA.
            'settings'           => ['nullable', 'array'],
            'settings.splash'    => ['nullable', 'string', 'max:50'],
            'settings.landing'   => ['nullable', 'string', 'max:50'],
            'settings.component' => ['nullable', Rule::in(['menu', 'agenda', 'services'])],

            // El pin del mapa es obligatorio: de él sale el barrio.
            'location'              => ['required', 'array'],
            'location.street'       => ['required', 'string', 'max:255'],
            'location.number'       => ['nullable', 'string', 'max:20'],
            'location.complement'   => ['nullable', 'string', 'max:255'],
            'location.neighborhood' => ['nullable', 'string', 'max:255'],
            'location.city'         => ['required', 'string', 'max:255'],
            'location.state'        => ['required', 'string', 'size:2'],
            'location.cep'          => ['nullable', 'string', 'max:10'],
            'location.latitude'     => ['required', 'numeric', 'between:-90,90'],
            'location.longitude'    => ['required', 'numeric', 'between:-180,180'],

            'referral_code' => ['nullable', 'string', 'max:12'],
        ];
    }
}
