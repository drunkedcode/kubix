<?php

namespace App\Http\Requests\Territory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBoundaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'polygon'             => ['required', 'array'],
            'polygon.type'        => ['required', Rule::in(['Polygon', 'MultiPolygon'])],
            'polygon.coordinates' => ['required', 'array', 'min:1'],
        ];
    }

    public function after(): array
    {
        return [fn ($v) => self::checkRing($v, $this->input('polygon', []))];
    }

    /** Anillo exterior con al menos 4 puntos y cerrado. */
    public static function checkRing($validator, array $polygon): void
    {
        $ring = ($polygon['type'] ?? null) === 'MultiPolygon'
            ? ($polygon['coordinates'][0][0] ?? [])
            : ($polygon['coordinates'][0] ?? []);

        if (count($ring) < 4 || $ring[0] !== end($ring)) {
            $validator->errors()->add('polygon', 'El límite debe ser un anillo cerrado de al menos 4 puntos.');
        }
    }
}
