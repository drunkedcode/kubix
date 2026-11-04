<?php

namespace App\Services\Domains\Business;

use App\Models\Business;

/**
 * Feeds the tabs of the Business "show" page.
 * One public method per tab (plus the base profile used by the page header).
 */
class BusinessShowService
{
    /** Base data of the page, present on every tab. */
    public function profile(Business $business): array
    {
        $location = $business->locations->firstWhere('is_primary', true)
            ?? $business->locations->first();

        return [
            'id'        => $business->id,
            'name'      => $business->name,
            'slug'      => $business->slug,
            'status'    => $business->status,
            'location'  => $location ? [
                'latitude'  => (float) $location->latitude,
                'longitude' => (float) $location->longitude,
            ] : null,
            'createdAt' => $business->created_at->format('d/m/Y'),
        ];
    }

    public function finance(Business $business): array
    {
        // MOCK: no real payments model yet.
        return [
            'monthly_subscription' => 150.00,
            'ad_spend_budget'      => 450.00,
            'commission_rate'      => '12%',
            'total_billed_ytd'     => 1850.00,
            'last_payment_status'  => 'Al día',
            'last_payment_date'    => '2026-10-10',
            'transactions'         => [
                ['id' => 101, 'concept' => 'Suscripción PWA - Octubre', 'amount' => 1500.00, 'status' => 'Pagado', 'date' => '2026-10-01'],
                ['id' => 102, 'concept' => 'Paquete Tráfico Local', 'amount' => 450.00, 'status' => 'Pagado', 'date' => '2026-10-05'],
            ],
        ];
    }
    
    public function ads(Business $business): array
    {
        // MOCK: no real ads model yet.
        return [
            'impressions' => 12400,
            'clicks'      => 310,
            'ctr'         => '2.5%',
            'spend'       => 450.00,
            'campaigns'   => [
                ['id' => 1, 'name' => 'Promo apertura', 'status' => 'Activa', 'impressions' => 8200, 'clicks' => 210],
                ['id' => 2, 'name' => 'Combo fin de semana', 'status' => 'Pausada', 'impressions' => 4200, 'clicks' => 100],
            ],
        ];
    }
}
