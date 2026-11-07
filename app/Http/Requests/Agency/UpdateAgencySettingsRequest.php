<?php

namespace App\Http\Requests\Agency;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAgencySettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // el acceso lo controla el middleware can:manage-agency de la ruta
    }

    /** Precios en centavos de real. */
    public function rules(): array
    {
        return [
            'onboarding_price' => ['nullable', 'integer', 'min:0', 'max:99999999'],
            'daily_price'      => ['nullable', 'integer', 'min:0', 'max:99999999'],
        ];
    }
}
