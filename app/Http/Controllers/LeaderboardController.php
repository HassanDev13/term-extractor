<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    public function index()
    {
        // Get top contributors with their edit counts
        $leaderboard = \DB::table('term_edits')
            ->select('users.id', 'users.name', 'users.email', \DB::raw('COUNT(*) as edit_count'))
            ->join('users', 'term_edits.user_id', '=', 'users.id')
            ->whereNotNull('term_edits.user_id')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('edit_count')
            ->limit(50)
            ->get();

        return Inertia::render('Leaderboard', [
            'leaderboard' => $leaderboard,
        ]);
    }
}
