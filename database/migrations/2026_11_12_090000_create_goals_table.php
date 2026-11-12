<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('territory_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('metric', 30);                                   // captured (negocios captados)
            $table->date('month');                                          // primer día del mes de la meta
            $table->unsignedInteger('target');                              // cuánto se espera lograr
            $table->foreignId('set_by')->nullable()->constrained('users')->nullOnDelete(); // quién la fijó
            $table->timestamps();

            // Una meta por persona, barrio, tipo y mes.
            $table->unique(['territory_id', 'user_id', 'metric', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
