<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Term extends Model
{
    protected $fillable = [
        "resource_page_id",
        "term_en",
        "term_ar",
        "confidence_level",
        "x",
        "y",
        "width",
        "height",
        "status",
        "rejection_reason",
    ];

    public function resourcePage()
    {
        return $this->belongsTo(ResourcePage::class);
    }

    /**
     * Get the edit history for this term.
     */
    public function edits()
    {
        return $this->hasMany(TermEdit::class);
    }
}
