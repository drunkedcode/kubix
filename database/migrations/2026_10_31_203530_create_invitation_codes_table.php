<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitation_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();

            $table->foreignId('territory_id')->nullable()->constrained('territories')->nullOnDelete(); // barrio que lo emitió
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();          // quien lo generó (Pedro)
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();        // promotor que lo reparte

            // Un solo uso: el negocio que lo consumió.
            $table->foreignId('business_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->timestamp('used_at')->nullable();

            $table->timestamps();

            $table->index(['assigned_to', 'used_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitation_codes');
    }
};