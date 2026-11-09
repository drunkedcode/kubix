<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PayBusinessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // quién es dueño del negocio lo comprueba el servicio
    }

    public function rules(): array
    {
        return [
            'method' => ['required', Rule::in(['pix', 'card', 'boleto'])],
        ];
    }
}
