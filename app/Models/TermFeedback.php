<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TermFeedback extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        "term_id",
        "is_positive",
        "user_ip_hash",
        "user_agent_hash",
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        "is_positive" => "boolean",
    ];

    /**
     * Get the term that this feedback belongs to.
     */
    public function term()
    {
        return $this->belongsTo(Term::class);
    }
}
