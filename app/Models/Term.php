<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Term extends Model
{
    protected $fillable = ['resource_page_id', 'term_en', 'term_ar'];

    public function resourcePage()
    {
        return $this->belongsTo(ResourcePage::class);
    }
    //
}
