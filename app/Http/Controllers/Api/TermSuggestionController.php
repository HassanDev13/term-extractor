<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TermSuggestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TermSuggestionController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'term' => 'required|string',
        ]);

        $term = strtolower(trim($request->query('term')));
        $userId = $request->user('sanctum')?->id ?? auth()->id();

        $suggestions = TermSuggestion::where('term', $term)
            ->with(['user:id,name']) // Eager load suggestor name
            ->withCount('votes_relation') // Count votes
            ->orderByDesc('votes')
            ->get()
            ->map(function ($suggestion) use ($userId) {
                return [
                    'id' => $suggestion->id,
                    'suggested_term' => $suggestion->suggested_term,
                    'votes' => $suggestion->votes, // This is the cached count column
                    'user_name' => $suggestion->user->name,
                    'is_voted' => $userId ? $suggestion->votes_relation()->where('user_id', $userId)->exists() : false,
                    'created_at' => $suggestion->created_at->diffForHumans(),
                ];
            });

        return response()->json($suggestions);
    }

    public function store(Request $request)
    {
        $user = $request->user('sanctum') ?? auth()->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'term' => 'required|string',
            'suggested_term' => 'required|string|max:255',
        ]);

        $term = strtolower(trim($request->input('term')));
        $suggestedTerm = trim($request->input('suggested_term'));

        // Check if suggestion already exists for this term
        $existing = TermSuggestion::where('term', $term)
            ->where('suggested_term', $suggestedTerm)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Suggestion already exists'], 422);
        }

        $suggestion = TermSuggestion::create([
            'term' => $term,
            'suggested_term' => $suggestedTerm,
            'user_id' => $user->id,
            'votes' => 0,
        ]);

        return response()->json($suggestion, 201);
    }

    public function vote(Request $request, $id)
    {
        $user = $request->user('sanctum') ?? auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $suggestion = TermSuggestion::findOrFail($id);
        
        // Toggle vote
        $vote = $suggestion->votes_relation()->where('user_id', $user->id)->first();

        if ($vote) {
            $vote->delete();
            $suggestion->decrement('votes');
            $voted = false;
        } else {
            $suggestion->votes_relation()->create(['user_id' => $user->id]);
            $suggestion->increment('votes');
            $voted = true;
        }

        return response()->json([
            'votes' => $suggestion->votes,
            'is_voted' => $voted
        ]);
    }
}
