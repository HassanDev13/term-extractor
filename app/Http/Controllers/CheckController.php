<?php

namespace App\Http\Controllers;

use App\Models\Term;
use App\Models\TermFeedback;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CheckController extends Controller
{
    /**
     * Show the check page with a specific term
     */
    public function show(Term $term)
    {
        $term->load(["resourcePage.resource"]);

        // Get adjacent terms for navigation
        $adjacentTerms = $this->getAdjacentTerms($term);

        // Get total terms count for progress
        $totalTerms = Term::count();

        // Calculate current position (approximate based on ID order)
        $currentPosition = Term::where("id", "<=", $term->id)->count();

        return Inertia::render("Check", [
            "term" => [
                "id" => $term->id,
                "term_en" => $term->term_en,
                "term_ar" => $term->term_ar,
                "confidence_level" => $term->confidence_level,
                "corrections" => $term->corrections,
                "status" => $term->status,
                "x" => $term->x,
                "y" => $term->y,
                "width" => $term->width,
                "height" => $term->height,
                "created_at" => $term->created_at,
            ],
            "page" => $term->resourcePage
                ? [
                    "id" => $term->resourcePage->id,
                    "page_number" => $term->resourcePage->page_number,
                    "image_path" => $term->resourcePage->image_path,
                ]
                : null,
            "resource" =>
                $term->resourcePage && $term->resourcePage->resource
                    ? [
                        "id" => $term->resourcePage->resource->id,
                        "name" => $term->resourcePage->resource->name,
                    ]
                    : null,
            "nextTermId" => $adjacentTerms["next"]?->id,
            "prevTermId" => $adjacentTerms["prev"]?->id,
            "totalTerms" => $totalTerms,
            "currentPosition" => $currentPosition,
        ]);
    }

    /**
     * Show a random term for checking
     */
    public function random()
    {
        // Get a random term that hasn't been checked too many times
        $term = Term::whereNotIn("status", ["rejected"])
            ->inRandomOrder()
            ->first();

        if (!$term) {
            // If no terms found, get any random term
            $term = Term::inRandomOrder()->first();
        }

        if ($term) {
            return redirect()->route("check.term", $term);
        }

        // No terms available
        return Inertia::render("Check", [
            "term" => null,
            "page" => null,
            "resource" => null,
            "nextTermId" => null,
            "prevTermId" => null,
            "totalTerms" => 0,
            "currentPosition" => 0,
        ]);
    }

    /**
     * Store feedback for a term
     */
    public function storeFeedback(Request $request, Term $term)
    {
        try {
            \Log::info("Feedback submission started", [
                "term_id" => $term->id,
                "data" => $request->all(),
                "ip" => $request->ip(),
            ]);

            $validated = $request->validate([
                "is_positive" => "required|boolean",
            ]);

            \Log::info("Feedback validation passed", $validated);

            // Get user IP for anonymous tracking (not storing for privacy)
            $userIp = $request->ip();
            $userAgent = $request->userAgent();

            // Create feedback record
            $feedback = TermFeedback::create([
                "term_id" => $term->id,
                "is_positive" => $validated["is_positive"],
                "user_ip_hash" => hash("sha256", $userIp . config("app.key")), // Anonymized
                "user_agent_hash" => hash(
                    "sha256",
                    $userAgent . config("app.key"),
                ), // Anonymized
            ]);

            \Log::info("Feedback record created", [
                "feedback_id" => $feedback->id,
            ]);

            // Update term statistics
            $this->updateTermFeedbackStats($term, $validated["is_positive"]);

            \Log::info("Feedback submission completed successfully");

            return back()->with("success", "Feedback submitted successfully");
        } catch (\Exception $e) {
            \Log::error("Feedback submission failed", [
                "term_id" => $term->id,
                "error" => $e->getMessage(),
                "trace" => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                "error" => "Failed to submit feedback. Please try again.",
            ]);
        }
    }

    /**
     * Get term feedback statistics
     */
    public function getStats(Term $term)
    {
        $feedback = TermFeedback::where("term_id", $term->id)
            ->selectRaw("COUNT(*) as total, SUM(is_positive) as positive_count")
            ->first();

        return response()->json([
            "total_feedback" => $feedback->total ?? 0,
            "positive_feedback" => $feedback->positive_count ?? 0,
            "negative_feedback" =>
                ($feedback->total ?? 0) - ($feedback->positive_count ?? 0),
            "positive_percentage" =>
                $feedback->total > 0
                    ? round(
                        ($feedback->positive_count / $feedback->total) * 100,
                        1,
                    )
                    : 0,
        ]);
    }

    /**
     * Get adjacent terms for navigation
     */
    private function getAdjacentTerms(Term $term)
    {
        $prevTerm = Term::where("id", "<", $term->id)
            ->orderBy("id", "desc")
            ->first();

        $nextTerm = Term::where("id", ">", $term->id)
            ->orderBy("id", "asc")
            ->first();

        return [
            "prev" => $prevTerm,
            "next" => $nextTerm,
        ];
    }

    /**
     * Update term feedback statistics
     */
    private function updateTermFeedbackStats(Term $term, bool $isPositive)
    {
        // Increment feedback counters
        if ($isPositive) {
            $term->increment("positive_feedback_count");
        } else {
            $term->increment("negative_feedback_count");
        }

        // Update total feedback count
        $term->total_feedback_count =
            $term->positive_feedback_count + $term->negative_feedback_count;

        // Update term status based on feedback counts
        if ($term->positive_feedback_count >= 10) {
            $term->status = "accepted";
        } elseif ($term->negative_feedback_count >= 10) {
            $term->status = "rejected";
        }

        $term->save();
    }
}
