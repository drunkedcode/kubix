<?php

namespace App\Console\Commands;

use App\Services\Domains\Access\AccessService;
use Illuminate\Console\Command;

class AccessSync extends Command
{
    protected $signature = 'access:sync';

    protected $description = 'Sync the config/access.php catalog into permissions and apply role defaults (additive only)';

    public function handle(AccessService $access): int
    {
        $result = $access->syncCatalog();

        $this->info("Permissions in catalog: {$result['permissions']}");

        foreach ($result['granted'] as $role => $count) {
            $this->line("  {$role}: {$count} defaults applied");
        }

        return self::SUCCESS;
    }
}