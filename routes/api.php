<?php

use App\Http\Controllers\ExtractController;
use Illuminate\Support\Facades\Route;

Route::post('/extract', [ExtractController::class, 'store']);