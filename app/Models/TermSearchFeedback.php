<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TermSearchFeedback extends Model
{
    protected $table = 'term_search_feedback';

    protected $fillable = [
        'term',
        'is_positive',
        'feedback_text',
        'user_id',
    ];

    protected $casts = [
        'is_positive' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
