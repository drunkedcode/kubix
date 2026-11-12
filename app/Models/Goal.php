<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Lo que se espera que logre una persona del equipo en un mes (por ejemplo, negocios captados). */
class Goal extends Model
{
    protected $fillable = ['territory_id', 'user_id', 'metric', 'month', 'target', 'set_by'];
}
