<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('territories', function (Blueprint $table) {
            $table->id();

            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('territories')
                ->cascadeOnDelete();

            // Niveles Matryoshka: País -> Estado -> Ciudad -> Barrio
            $table->enum('type', ['country', 'state', 'city', 'neighborhood']);

            $table->string('name');
            $table->string('slug');
            $table->string('code')->nullable(); // BR, PR, CWB, o código del barrio
            $table->string('osm_id')->nullable(); // ej: relation/123456 (solo barrios)
            $table->string('boundary_source')->default('osm'); // osm | manual

            // Materialized Path (ej: "1/2/5/12") para consultas rápidas en jerarquía
            $table->string('path');

            // Geolocalización y Polígonos (GeoJSON)
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->json('polygon')->nullable(); // Almacena los bordes en GeoJSON

            // Configuración propia del barrio: colores, nombre público, comunidad, etc.
            $table->json('settings')->nullable();

            $table->enum('status', ['active', 'inactive'])->default('active');

            // Índices de rendimiento
            $table->index(['path', 'type', 'status']);
            $table->unique(['parent_id', 'type', 'name']);
            $table->unique(['parent_id', 'type', 'code']);
            $table->unique(['parent_id', 'slug']);
            $table->unique(['parent_id', 'osm_id']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('territories');
    }
};