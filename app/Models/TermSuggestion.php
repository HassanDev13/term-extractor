<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TermSuggestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'term',
        'suggested_term',
        'user_id',
        'votes'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function votes_relation()
    {
        return $this->hasMany(TermSuggestionVote::class);
    }
}
