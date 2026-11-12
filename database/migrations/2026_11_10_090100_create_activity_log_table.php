<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('territory_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete(); // quién lo hizo (null = sistema)
            $table->nullableMorphs('subject');                              // sobre qué: negocio, usuario...
            $table->string('event', 60);                                    // business.activated, member.assigned...
            $table->json('properties')->nullable();                         // detalle del evento
            $table->timestamp('created_at')->useCurrent();

            $table->index(['territory_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_log');
    }
};
