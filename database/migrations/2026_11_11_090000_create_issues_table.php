<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('territory_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reporter_id')->nullable()->constrained('users')->nullOnDelete(); // quién lo reportó desde la app
            $table->foreignId('business_id')->nullable()->constrained()->nullOnDelete();        // negocio al que se refiere (opcional)
            $table->string('category', 30);                                                      // mural | directory | jobs | app
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status', 20)->default('new')->index();                               // new | in_progress | resolved
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['territory_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issues');
    }
};
