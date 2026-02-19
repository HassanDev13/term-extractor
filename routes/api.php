<?php

use App\Http\Controllers\ExtractController;
use Illuminate\Support\Facades\Route;

Route::post('/upload', [ExtractController::class, 'upload']);

Route::post('/clean_text/{resource:id}', [ExtractController::class, 'cleanText']);

use App\Http\Controllers\Api\SearchController;

Route::get('/search', [SearchController::class, 'search']);
Route::get('/resources', [SearchController::class, 'resources']);

use App\Http\Controllers\Api\ChatController;
Route::post('/chat', [ChatController::class, 'chat']);

use App\Http\Controllers\Api\TermSuggestionController;
Route::get('/term_suggestions', [TermSuggestionController::class, 'index']); // Public view
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/term_suggestions', [TermSuggestionController::class, 'store']); // Create
    Route::post('/term_suggestions/{id}/vote', [TermSuggestionController::class, 'vote']); // Vote
});
