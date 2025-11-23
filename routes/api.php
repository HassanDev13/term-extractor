<?php

use App\Http\Controllers\ExtractController;
use Illuminate\Support\Facades\Route;

Route::post('/extract', [ExtractController::class, 'store']);

Route::post('/upload', [ExtractController::class, 'upload']);

Route::post('/clean_text/{resource:id}', [ExtractController::class, 'cleanText']);