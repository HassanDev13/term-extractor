<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TermController;

Route::get('/', [TermController::class, 'index'])->name('terms.index');

use App\Http\Controllers\VerificationController;

Route::get('/terms/{term}/verify', [VerificationController::class, 'verifyTerm'])->name('terms.verify');
Route::get('/pages/{page}/verify', [VerificationController::class, 'verifyPage'])->name('pages.verify');
Route::get('/resources/{resource}/pdf', [VerificationController::class, 'servePdf'])->name('resources.pdf');
Route::put('/terms/{term}/status', [VerificationController::class, 'updateTermStatus'])->name('terms.update-status');
