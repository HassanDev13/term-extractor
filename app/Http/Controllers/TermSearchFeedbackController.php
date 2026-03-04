<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\TermSearchFeedback;

class TermSearchFeedbackController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'term' => 'required|string|max:255',
            'is_positive' => 'required|boolean',
            'feedback_text' => 'nullable|string|max:1000',
        ]);

        $feedback = TermSearchFeedback::updateOrCreate(
            [
                'term' => $validated['term'],
                'user_id' => auth()->id(),
            ],
            [
                'is_positive' => $validated['is_positive'],
                'feedback_text' => $validated['feedback_text'] ?? null,
            ]
        );

        return response()->json(['success' => true]);
    }
}
