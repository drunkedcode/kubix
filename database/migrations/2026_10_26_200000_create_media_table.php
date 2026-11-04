<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->morphs('mediable');                 // dueño: agencia, negocio, etc.
            $table->string('collection')->default('default'); // logo, gallery, contract...
            $table->enum('kind', ['image', 'document', 'video']);
            $table->string('disk')->default('public');
            $table->string('path');
            $table->string('name');
            $table->string('original_name');
            $table->string('mime');
            $table->string('extension', 10);
            $table->unsignedBigInteger('size');
            $table->unsignedInteger('sort_order')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['mediable_type', 'mediable_id', 'collection']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
