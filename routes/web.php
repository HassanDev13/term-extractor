<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TermController;

Route::get("/", [TermController::class, "index"])->name("terms.index");

// Redirect old /terms route to root for backward compatibility
Route::redirect("/terms", "/", 301);

// Authentication routes
use App\Http\Controllers\AuthController;

Route::get("/login", [AuthController::class, "showLogin"])->name("login");
Route::post("/login", [AuthController::class, "login"]);
Route::post("/logout", [AuthController::class, "logout"])->name("logout");

// Locale switching route
Route::post("/locale/{locale}", function ($locale) {
    if (in_array($locale, ["en", "ar"])) {
        session(["locale" => $locale]);
    }
    return redirect()->back();
})->name("locale.switch");

use App\Http\Controllers\VerificationController;

// Verification view routes - accessible to all users (read-only for guests)
Route::get("/terms/{term}/verify", [
    VerificationController::class,
    "verifyTerm",
])->name("terms.verify");
Route::get("/pages/{page}/verify", [
    VerificationController::class,
    "verifyPage",
])->name("pages.verify");
Route::get("/resources/{resource}/pdf", [
    VerificationController::class,
    "servePdf",
])->name("resources.pdf");
Route::get("/pages/{page}/image", [
    VerificationController::class,
    "serveImage",
])->name("pages.image");

// Leaderboard route - accessible to all users
use App\Http\Controllers\LeaderboardController;
Route::get("/leaderboard", [LeaderboardController::class, "index"])->name(
    "leaderboard",
);

// Verification mutation routes - require authentication
Route::middleware("auth")->group(function () {
    Route::put("/terms/{term}", [
        VerificationController::class,
        "updateTerm",
    ])->name("terms.update");
    Route::put("/terms/{term}/status", [
        VerificationController::class,
        "updateTermStatus",
    ])->name("terms.update-status");
});
