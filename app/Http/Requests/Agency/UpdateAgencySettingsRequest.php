<?php

namespace App\Http\Requests\Agency;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAgencySettingsRequest extends FormRequest
{
    private const ADDRESS_FIELDS = ['cep', 'street', 'number', 'complement', 'neighborhood', 'city', 'state'];

    public function authorize(): bool
    {
        return true; // el acceso lo controla el middleware can:manage-agency de la ruta
    }

    public function rules(): array
    {
        $address = [];
        foreach (self::ADDRESS_FIELDS as $field) {
            $address["address.{$field}"] = ['nullable', 'string', 'max:120'];
        }

        return [
            'public_name'     => ['nullable', 'string', 'max:80'],
            'tagline'         => ['nullable', 'string', 'max:160'],
            'primary_color'   => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'secondary_color' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'contact_email'   => ['nullable', 'email', 'max:120'],
            'contact_phone'   => ['nullable', 'string', 'max:30'],
            'address'         => ['nullable', 'array'],
            ...$address,
            'logo'            => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'cover'           => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
