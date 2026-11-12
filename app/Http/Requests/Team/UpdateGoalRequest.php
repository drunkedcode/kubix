<?php

namespace App\Http\Requests\Team;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // el permiso manage-team lo exige la ruta
    }

    public function rules(): array
    {
        return [
            'target' => ['required', 'integer', 'min:0', 'max:1000'],
        ];
    }
}
