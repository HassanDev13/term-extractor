<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Resource extends Model
{
    protected $fillable = ['name', 'path', 'status', 'error_message'];

    public function pages(): HasMany
    {
        return $this->hasMany(ResourcePage::class);
    }
}
