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
            self::Food   => 'Comida',
            self::Beauty => 'Beleza',
            self::Legal  => 'Jurídico',
            self::Health => 'Saúde',
            self::Retail => 'Comércio',
            self::Other  => 'Outro',
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