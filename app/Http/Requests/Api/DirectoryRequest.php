<?php

namespace App\Http\Requests\Api;

use App\Enums\BusinessSegment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DirectoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // el acceso lo controlan auth:sanctum y el contexto de barrio
    }

    protected function prepareForValidation(): void
    {
        $search = trim((string) $this->input('q'));

        $this->merge(['q' => $search !== '' ? $search : null]);
    }

    public function rules(): array
    {
        return [
            'segment' => ['nullable', Rule::enum(BusinessSegment::class)],
            'q'       => ['nullable', 'string', 'max:100'],
        ];
    }
}
