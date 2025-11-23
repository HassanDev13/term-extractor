<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResourcePage extends Model
{
    protected $fillable = [
        'resource_id',
        'page_number',
        'image_path',
        'text',
        'status',
        'error_message'
    ];

    public function resource(): BelongsTo
    {
        return $this->belongsTo(Resource::class);
    }

    public function terms()
    {
        return $this->hasMany(Term::class);
    }
}
