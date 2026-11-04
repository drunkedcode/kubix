<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memberships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->morphs('memberable');               // territorio | negocio | agencia
            $table->string('role', 30);                 // gerente, funcionaria, owner, staff...
            $table->timestamp('starts_at')->nullable(); // vigencia (licencias de barrio, más adelante)
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();

            // Una sola fila por usuario y cosa.
            $table->unique(['user_id', 'memberable_type', 'memberable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memberships');
    }
};