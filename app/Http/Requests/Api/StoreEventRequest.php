<?php

namespace App\Http\Requests\Api;

use App\Services\Domains\Analytics\AnalyticsService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // el acceso lo controlan auth:sanctum y el contexto de barrio
    }

    public function rules(): array
    {
        return [
            'type'         => ['required', Rule::in(AnalyticsService::EVENT_TYPES)],
            // La vista del perfil la registra el servidor al abrirlo; acá solo la de una promoción.
            'promotion_id' => [
                'required_if:type,view',
                'nullable',
                'integer',
                Rule::exists('promotions', 'id')->where('business_id', (int) $this->route('business')),
            ],
        ];
    }
}
