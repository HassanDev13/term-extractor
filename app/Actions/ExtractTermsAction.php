<?php

namespace App\Actions;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ExtractTermsAction
{
    public function execute(UploadedFile $file, bool $useGpt, bool $useTesseract): array
    {
        $path = $file->store('uploads');

        $text = '';

        if ($useTesseract) {
            $text .= $this->extractWithTesseract($path);
        }

        if ($useGpt) {
            $text = $this->processWithGpt($text);
        }

        Storage::delete($path);

        return [
            'text' => $text,
            'source' => basename($path),
        ];
    }

    protected function extractWithTesseract(string $path): string
    {
        return 'Mocked OCR text from ' . $path;
    }

    protected function processWithGpt(string $text): string
    {
        return 'Processed text: ' . $text;
    }
}
