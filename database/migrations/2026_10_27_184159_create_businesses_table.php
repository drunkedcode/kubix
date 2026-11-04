<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('segment', 30)->index();                    // enum BusinessSegment: food, beauty...
            $table->string('phone', 20)->nullable();                   // teléfono del negocio, solo dígitos
            $table->string('status', 20)->default('standby')->index(); // standby | active | inactive

            $table->foreignId('registered_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamp('activated_at')->nullable();
            $table->foreignId('activated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};