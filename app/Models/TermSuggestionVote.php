<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TermSuggestionVote extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'term_suggestion_id'
    ];
}
