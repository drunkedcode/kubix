<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Location;
use App\Models\Territory;
use App\Models\User;
use App\Services\Domains\Goal\GoalService;
use App\Services\Domains\Membership\MembershipService;
use App\Services\Domains\Payment\PaymentService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Datos de prueba del barrio Armando Mendes (Manaus): equipo, 13 negocios con sus pagos,
 * promociones, valoraciones, eventos de analítica y actividad. Solo en entorno local.
 */
class DemoSeeder extends Seeder
{
    // nombre, segmento, estado final, ¿lo captó el promotor?
    private const BUSINESSES = [
        ['Padaria do Ze',            'food',   'active',   false],
        ['Salão Beleza Pura',        'beauty', 'active',   true],
        ['Mercado Bom Preço',        'retail', 'active',   true],
        ['Barbearia Navalha',        'beauty', 'active',   true],
        ['Dona Flor Confeitaria',    'food',   'standby',  true],
        ['Açougue Central',          'retail', 'active',   false],
        ['Studio Fit',               'health', 'active',   true],
        ['Lanchonete Sabor',         'food',   'active',   true],
        ['Clínica Vida',             'health', 'standby',  false],
        ['Advocacia Lima',           'legal',  'active',   false],
        ['Casa & Cia',               'retail', 'active',   false],
        ['Farmácia Popular',         'health', 'inactive', false],
        ['Pet Shop Amigo',           'retail', 'standby',  true],
    ];

    public function run(): void
    {
        mt_srand(42); // datos repetibles

        $admin       = User::where('email', 'superadmin@kubix.com')->firstOrFail();
        $territory   = Territory::where('type', 'neighborhood')->where('slug', 'armando-mendes')->firstOrFail();
        $memberships = app(MembershipService::class);
        $payments    = app(PaymentService::class);

        // Precios del barrio, en centavos.
        $territory->update(['settings' => array_merge($territory->settings ?? [], [
            'onboarding_price' => 2000,
            'daily_price'      => 500,
            'promotion_price'  => 1000,
        ])]);

        // Equipo del barrio.
        $pedro  = $this->user('pedro@kubix.com', 'Pedro');
        $carlos = $this->user('carlos@kubix.com', 'Carlos Promotor');
        $memberships->assign($admin, $territory->id, $pedro->id, 'district_admin');
        $memberships->assign($admin, $territory->id, $carlos->id, 'promoter');

        // El equipo lo registra MembershipService::assign() con fecha de ahora: se lo fecha hacia atrás.
        $this->backdate($pedro, 'member.assigned', 48);
        $this->backdate($carlos, 'member.assigned', 47);

        // Metas de captación de Carlos: la del mes pasado y la de este mes.
        $goals = app(GoalService::class);
        $goals->set($pedro, $territory, $carlos->id, 6, now()->subMonthNoOverflow());
        $goals->set($pedro, $territory, $carlos->id, 8, now());
        $activity = [];

        // Negocios, uno por uno: dueño, ubicación y, si corresponde, el cobro que lo activa.
        $businesses = [];
        foreach (self::BUSINESSES as $i => [$name, $segment, $status, $referred]) {
            $n     = $i + 1;
            $owner = $this->user("dono{$n}@kubix.com", "Dono(a) de {$name}");

            $business = Business::create([
                'name'          => $name,
                'slug'          => Str::slug($name),
                'segment'       => $segment,
                'phone'         => sprintf('92980%05d', 1000 + $n),
                'status'        => 'standby',
                'registered_by' => $owner->id,
                'referred_by'   => $referred ? $carlos->id : null,
            ]);

            $business->members()->attach($owner->id, ['role' => 'owner']);

            Location::create([
                'locatable_type' => $business->getMorphClass(),
                'locatable_id'   => $business->id,
                'territory_id'   => $territory->id,
                'label'          => 'Sede',
                'neighborhood'   => $territory->name,
                'city'           => 'Manaus',
                'state'          => 'AM',
                'latitude'       => -3.0900 + ($n - 7) * 0.0008,
                'longitude'      => -59.9400 + (($n * 37) % 13 - 6) * 0.0007,
                'is_primary'     => true,
                'created_by'     => $owner->id,
            ]);

            // El alta se inserta a mano (el negocio se crea directo con Eloquent); la activación la registra PaymentService.
            $activity[] = $this->activity($territory, $owner, $business, 'business.registered', ['name' => $name], 45 - 2 * $n);

            if ($status !== 'standby') {
                $payments->pay($business, 'onboarding', 'cash', $pedro->id);
                $this->backdate($business, 'business.activated', 44 - 2 * $n);
            }

            if ($status === 'inactive') {
                $business->update(['status' => 'inactive']);
            }

            // Fechas de alta y activación coherentes con el historial (el cobro las dejó en "ahora").
            DB::table('businesses')->where('id', $business->id)->update([
                'created_at'   => now()->subDays(45 - 2 * $n),
                'activated_at' => $status === 'standby' ? null : now()->subDays(44 - 2 * $n),
            ]);

            $businesses[] = $business->fresh();
        }

        $active = collect($businesses)->where('status', 'active')->values();
        $owners = User::where('email', 'like', 'dono%@kubix.com')->pluck('id', 'email');

        $this->promotions($active->take(4));
        $this->reviews($active->take(8), $owners->values());
        $this->events($active->take(8));

        DB::table('activity_log')->insert($activity);
        $this->issues($territory, $pedro, $owners->values());
    }

    /** Cinco reclamos reportados por vecinos; los dos más viejos ya los resolvió Pedro. */
    private function issues(Territory $territory, User $resolver, $reporterIds): void
    {
        // categoría, título, estado, edad en días
        $samples = [
            ['mural',     'O mural não carrega as fotos novas',     'new',         1],
            ['directory', 'Negócio duplicado no diretório',         'in_progress', 4],
            ['jobs',      'A notificação de vagas não chega',       'new',         6],
            ['app',       'O splash mostra o bairro errado',        'resolved',    9],
            ['directory', 'Horário incorreto em uma padaria',       'resolved',    12],
        ];

        $rows = [];

        foreach ($samples as $i => [$category, $title, $status, $age]) {
            $rows[] = [
                'territory_id' => $territory->id,
                'reporter_id'  => $reporterIds[$i % $reporterIds->count()],
                'category'     => $category,
                'title'        => $title,
                'status'       => $status,
                'resolved_at'  => $status === 'resolved' ? now()->subDays($age - 2) : null,
                'resolved_by'  => $status === 'resolved' ? $resolver->id : null,
                'created_at'   => now()->subDays($age),
                'updated_at'   => now()->subDays($age),
            ];
        }

        DB::table('issues')->insert($rows);
    }

    private function user(string $email, string $name): User
    {
        return User::firstOrCreate(
            ['email' => $email],
            ['name' => $name, 'password' => Hash::make('password'), 'email_verified_at' => now()],
        );
    }

    /** Cambia la fecha de un evento que la lógica real acaba de registrar. */
    private function backdate($subject, string $event, int $daysAgo): void
    {
        DB::table('activity_log')
            ->where('subject_type', $subject->getMorphClass())
            ->where('subject_id', $subject->getKey())
            ->where('event', $event)
            ->update(['created_at' => now()->subDays($daysAgo)]);
    }

    /** Fila del registro de actividad, ocurrida hace $daysAgo días. */
    private function activity(Territory $territory, User $actor, $subject, string $event, array $properties, int $daysAgo): array
    {
        return [
            'territory_id' => $territory->id,
            'actor_id'     => $actor->id,
            'subject_type' => $subject->getMorphClass(),
            'subject_id'   => $subject->id,
            'event'        => $event,
            'properties'   => json_encode($properties),
            'created_at'   => now()->subDays(max($daysAgo, 0)),
        ];
    }

    /** Dos promociones por negocio: una vigente y una ya terminada. */
    private function promotions($businesses): void
    {
        $rows = [];

        foreach ($businesses as $business) {
            $rows[] = [
                'business_id' => $business->id, 'title' => "Oferta da semana · {$business->name}",
                'description' => 'Desconto especial para moradores do bairro.', 'price_cents' => 1990,
                'status' => 'active', 'starts_at' => now()->subDays(3), 'ends_at' => now()->addDays(11),
                'created_at' => now()->subDays(3), 'updated_at' => now()->subDays(3),
            ];
            $rows[] = [
                'business_id' => $business->id, 'title' => 'Promoção de inauguração',
                'description' => null, 'price_cents' => null,
                'status' => 'ended', 'starts_at' => now()->subDays(40), 'ends_at' => now()->subDays(26),
                'created_at' => now()->subDays(40), 'updated_at' => now()->subDays(26),
            ];
        }

        DB::table('promotions')->insert($rows);
    }

    /** Tres valoraciones por negocio, de dueños de otros negocios. */
    private function reviews($businesses, $ownerIds): void
    {
        $comments = ['Ótimo atendimento!', 'Gostei muito, voltarei.', 'Bom, mas poderia melhorar o prazo.'];
        $rows     = [];

        foreach ($businesses as $index => $business) {
            $reviewers = $ownerIds->reject(fn ($id) => $id === $business->members()->first()?->id)->values();

            foreach (range(0, 2) as $k) {
                $rows[] = [
                    'business_id' => $business->id,
                    'user_id'     => $reviewers[($index + $k) % $reviewers->count()],
                    'rating'      => mt_rand(3, 5),
                    'comment'     => $comments[$k],
                    'created_at'  => now()->subDays(mt_rand(1, 40)),
                    'updated_at'  => now(),
                ];
            }
        }

        DB::table('business_reviews')->insert($rows);
    }

    /** Ocho semanas de visualizaciones, clics, WhatsApp y conversiones, creciendo semana a semana. */
    private function events($businesses): void
    {
        $rows = [];

        foreach ($businesses as $business) {
            foreach (range(0, 7) as $week) {
                $views  = mt_rand(15, 30) + $week * 3;
                $counts = [
                    'view'       => $views,
                    'click'      => (int) round($views * 0.12),
                    'whatsapp'   => (int) round($views * 0.04),
                    'conversion' => (int) round($views * 0.02),
                ];

                foreach ($counts as $type => $amount) {
                    for ($k = 0; $k < $amount; $k++) {
                        $rows[] = [
                            'business_id' => $business->id,
                            'type'        => $type,
                            'occurred_at' => now()->subWeeks(7 - $week)->subDays(mt_rand(0, 6))->subMinutes(mt_rand(0, 1439)),
                        ];
                    }
                }
            }
        }

        foreach (array_chunk($rows, 500) as $chunk) {
            DB::table('analytics_events')->insert($chunk);
        }
    }
}
