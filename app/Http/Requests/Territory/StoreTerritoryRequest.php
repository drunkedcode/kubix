<?php

namespace App\Http\Requests\Territory;

use App\Services\Domains\Territory\Config\TerritoryDataService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTerritoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $countries = array_keys(app(TerritoryDataService::class)->supportedCountries());

        return [
            'country'         => ['required', Rule::in($countries)],
            'state'           => ['required', 'string', 'max:10'],
            'city'            => ['required', 'string', 'max:20'],
            'osm_id'          => ['required', 'regex:/^(node|way|relation)\/\d+$/'],
            'name'            => ['required', 'string', 'max:255'],
            'boundary_source' => ['nullable', Rule::in(['osm', 'manual'])],
            'polygon'         => ['required', 'array'],
            'polygon.type'    => ['required', Rule::in(['Polygon', 'MultiPolygon'])],
            'polygon.coordinates' => ['required', 'array', 'min:1'],
        ];
    }

    public function after(): array
    {
        return [fn ($v) => UpdateBoundaryRequest::checkRing($v, $this->input('polygon', []))];
    }
}
