<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Resource extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'path', 'force_ocr', 'status', 'error_message', 'rejection_reason', 'verification_status'];

    public function pages(): HasMany
    {
        return $this->hasMany(ResourcePage::class);
    }
}
