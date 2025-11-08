<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExtractRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'], // 10MB max
            'use_gpt' => ['required', 'boolean'],
            'use_tesseract' => ['required', 'boolean'],
        ];
    }
}
