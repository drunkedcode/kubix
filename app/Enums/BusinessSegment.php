<?php

namespace App\Enums;

enum BusinessSegment: string
{
    case Food = 'food';
    case Beauty = 'beauty';
    case Legal = 'legal';
    case Health = 'health';
    case Retail = 'retail';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Food   => 'Comidas',
            self::Beauty => 'Belleza',
            self::Legal  => 'Legal',
            self::Health => 'Salud',
            self::Retail => 'Comercio',
            self::Other  => 'Otro',
        };
    }

    /** Catálogo para los selects del front: [{value, label}]. */
    public static function options(): array
    {
        return array_map(
            fn (self $s) => ['value' => $s->value, 'label' => $s->label()],
            self::cases(),
        );
    }
}