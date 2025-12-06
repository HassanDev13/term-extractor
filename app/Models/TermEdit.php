<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TermEdit extends Model
{
    protected $fillable = [
        'term_id',
        'user_id',
        'field_changed',
        'old_value',
        'new_value',
    ];

    /**
     * Get the term that was edited.
     */
    public function term()
    {
        return $this->belongsTo(Term::class);
    }

    /**
     * Get the user who made the edit.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
