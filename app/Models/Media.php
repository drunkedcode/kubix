<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    protected $table = 'media';

    protected $fillable = [
        'mediable_type', 'mediable_id', 'collection', 'kind', 'disk', 'path', 'name',
        'original_name', 'mime', 'extension', 'size', 'sort_order', 'created_by',
    ];

    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }

    public function url(?int $minutes = null): string
    {
        $disk = Storage::disk($this->disk);

        return $minutes ? $disk->temporaryUrl($this->path, now()->addMinutes($minutes)) : $disk->url($this->path);
    }
}
