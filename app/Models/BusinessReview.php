<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** La valoración (1 a 5) que una persona le dejó a un negocio. */
class BusinessReview extends Model
{
    protected $fillable = ['business_id', 'user_id', 'rating', 'comment'];
}
