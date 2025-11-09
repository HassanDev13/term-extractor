<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
});

it('accepts a valid request and returns success response', function () {
    $file = UploadedFile::fake()->create('sample.pdf', 500, 'application/pdf');

    $response = $this->postJson('/api/extract', [
        'file' => $file,
        'use_gpt' => true,
        'use_tesseract' => true,
        'page' => 1
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'status',
            'data' => [
                'text',
                'source',
            ],
        ]);
});

it('requires all fields', function () {
    $response = $this->postJson('/api/extract', []);

    $response->assertStatus(status: 422)
        ->assertJsonValidationErrors(['file', 'use_gpt', 'use_tesseract']);
});

it('rejects invalid file types', function () {
    $file = UploadedFile::fake()->create('invalid.txt', 10, 'text/plain');

    $response = $this->postJson('/api/extract', [
        'file' => $file,
        'use_gpt' => true,
        'use_tesseract' => true,
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['file']);
});

it('casts boolean fields correctly', function () {
    $file = UploadedFile::fake()->create('term.pdf', 100, 'application/pdf');

    $response = $this->postJson('/api/extract', [
        'file' => $file,
        'use_gpt' => '0',
        'use_tesseract' => '1',
        'page' => 1
    ]);

    $response->assertOk();

    expect($response->json('data'))
        ->toHaveKeys(['text', 'source']);
});
