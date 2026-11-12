<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePromotionStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // quién es dueño del negocio lo comprueba el servicio
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['paused', 'active'])],
        ];
    }
}
