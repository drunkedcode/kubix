<?php

namespace App\Http\Requests\Agency;

use Illuminate\Foundation\Http\FormRequest;

class UpdateIssueStatusRequest extends FormRequest
{
    /** El permiso (manage-issues) lo exige la ruta. */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:in_progress,resolved'],
        ];
    }
}
