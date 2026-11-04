<?php

namespace App\Models\Concerns;

use App\Models\Media;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/** Para cualquier modelo que tenga archivos (agencia, negocio...). */
trait HasMedia
{
    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable')->orderBy('sort_order');
    }

    /** Guarda en `media` el array que devuelve MediaUploader. */
    public function attachMedia(array $file, string $collection = 'default', ?int $userId = null): Media
    {
        return $this->media()->create([
            'collection'    => $collection,
            'kind'          => rtrim($file['kind'], 's'), // images -> image
            'disk'          => $file['disk'],
            'path'          => $file['path'],
            'name'          => $file['name'],
            'original_name' => $file['original_name'],
            'mime'          => $file['mime'],
            'extension'     => $file['extension'],
            'size'          => $file['size'],
            'created_by'    => $userId,
        ]);
    }
}
