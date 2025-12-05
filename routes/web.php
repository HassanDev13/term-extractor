<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TermController;

Route::get('/', [TermController::class, 'index'])->name('terms.index');

// Redirect old /terms route to root for backward compatibility
Route::redirect('/terms', '/', 301);

use App\Http\Controllers\VerificationController;

// Verification routes - require authentication
Route::middleware('auth')->group(function () {
    Route::get('/terms/{term}/verify', [VerificationController::class, 'verifyTerm'])->name('terms.verify');
    Route::get('/pages/{page}/verify', [VerificationController::class, 'verifyPage'])->name('pages.verify');
    Route::get('/resources/{resource}/pdf', [VerificationController::class, 'servePdf'])->name('resources.pdf');
    Route::put('/terms/{term}', [VerificationController::class, 'updateTerm'])->name('terms.update');
    Route::put('/terms/{term}/status', [VerificationController::class, 'updateTermStatus'])->name('terms.update-status');
});
