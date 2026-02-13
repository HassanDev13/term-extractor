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
use App\Http\Controllers\Api\ChatV2Controller;
Route::post('/chat_v2', [ChatV2Controller::class, 'chat']);
