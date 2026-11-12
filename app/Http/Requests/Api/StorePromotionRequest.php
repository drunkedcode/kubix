<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StorePromotionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // quién es dueño del negocio lo comprueba el servicio
    }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'price_cents' => ['nullable', 'integer', 'min:0'],
            'ends_at'     => ['nullable', 'date', 'after:now'],
        ];
    }
}
