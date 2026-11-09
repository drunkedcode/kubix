<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();

            $table->string('kind', 20)->index();                       // onboarding | daily | promotion
            $table->unsignedInteger('amount');                         // centavos
            $table->string('method', 20);                              // pix | card | boleto | cash
            $table->string('status', 20)->default('pending')->index(); // pending | paid | failed
            $table->string('reference')->nullable();                   // id en la pasarela (cuando exista)

            $table->timestamp('paid_at')->nullable();
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete(); // quién lo marcó a mano

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
