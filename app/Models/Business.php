<?php

namespace App\Models;

use App\Models\Concerns\HasLocations;
use App\Models\Concerns\HasMedia;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Business extends Model
{
    use HasFactory;
    use HasLocations;
    use HasMedia;

    protected $fillable = [
        'name',
        'slug',
        'status',
    ];
}